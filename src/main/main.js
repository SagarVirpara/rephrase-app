const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { rephraseText } = require('../services/ai');

// Single instance lock - MUST be at the top before anything else
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    let mainWindow = null;
    let originalClipboard = '';

    // Settings file path
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');

    function loadSettings() {
        try {
            if (fs.existsSync(settingsPath)) {
                return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        return {
            model: 'qwen2.5:0.5b',
            autoPaste: true,
            generateVariations: false,
            theme: 'dark'
        };
    }

    function saveSettings(settings) {
        try {
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    }

    function createWindow() {
        // Get cursor position to show window near it
        const cursorPoint = screen.getCursorScreenPoint();
        const display = screen.getDisplayNearestPoint(cursorPoint);

        // Calculate position (centered near cursor but within screen bounds)
        const windowWidth = 450;
        const windowHeight = 420;

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
            return;
        }

        createWindow();
    }

    // Auto-paste function
    function autoPaste() {
        if (process.platform === 'darwin') {
            exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
        } else if (process.platform === 'win32') {
            exec('powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\'^v\')"');
        }
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

    ipcMain.handle('use-text', async (event, text, shouldAutoPaste) => {
        clipboard.writeText(text);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }

        // Auto-paste if enabled
        if (shouldAutoPaste) {
            await new Promise(resolve => setTimeout(resolve, 100));
            autoPaste();
        }

        return true;
    });

    ipcMain.handle('close-window', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }
    });

    ipcMain.handle('get-settings', () => {
        return loadSettings();
    });

    ipcMain.handle('save-settings', (event, settings) => {
        return saveSettings(settings);
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

        console.log('RePhrase V2 is running! Press', shortcut, 'to activate.');
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });

    app.on('window-all-closed', () => {
        // Don't quit the app when all windows are closed
        // It should stay running in the background
    });
}
