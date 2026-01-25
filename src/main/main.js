const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen } = require('electron');
const path = require('path');
const { rephraseText } = require('../services/ai');

// Single instance lock - MUST be at the top before anything else
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    let mainWindow = null;
    let originalClipboard = '';

    function createWindow() {
        // Get cursor position to show window near it
        const cursorPoint = screen.getCursorScreenPoint();
        const display = screen.getDisplayNearestPoint(cursorPoint);

        // Calculate position (centered near cursor but within screen bounds)
        const windowWidth = 420;
        const windowHeight = 340;

        let x = cursorPoint.x - windowWidth / 2;
        let y = cursorPoint.y - 50;

        // Keep window within screen bounds
        const bounds = display.workArea;
        x = Math.max(bounds.x, Math.min(x, bounds.x + bounds.width - windowWidth));
        y = Math.max(bounds.y, Math.min(y, bounds.y + bounds.height - windowHeight));

        mainWindow = new BrowserWindow({
            width: windowWidth,
            height: windowHeight,
            x: Math.round(x),
            y: Math.round(y),
            frame: false,
            transparent: true,
            resizable: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            mainWindow.focus();
        });

        mainWindow.on('blur', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.close();
            }
        });

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }

    function triggerRephrase() {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
            return;
        }

        // Read clipboard content
        originalClipboard = clipboard.readText();

        if (!originalClipboard || originalClipboard.trim().length === 0) {
            // TODO: Could show a notification that clipboard is empty
            return;
        }

        createWindow();
    }

    // IPC Handlers
    ipcMain.handle('get-clipboard', () => {
        return originalClipboard;
    });

    ipcMain.handle('rephrase', async (event, text, tone) => {
        try {
            const result = await rephraseText(text, tone);
            return { success: true, text: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('use-text', (event, text) => {
        clipboard.writeText(text);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }
        return true;
    });

    ipcMain.handle('close-window', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }
    });

    app.whenReady().then(() => {
        // Register global shortcut
        const shortcut = process.platform === 'darwin' ? 'Command+Shift+R' : 'Control+Shift+R';

        const registered = globalShortcut.register(shortcut, triggerRephrase);

        if (!registered) {
            console.error('Failed to register global shortcut');
        }

        // Hide dock icon on macOS (we want to be a utility app)
        if (process.platform === 'darwin') {
            app.dock.hide();
        }

        console.log('RePhrase is running! Press', shortcut, 'to activate.');
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });

    app.on('window-all-closed', () => {
        // Don't quit the app when all windows are closed
        // It should stay running in the background
    });
}
