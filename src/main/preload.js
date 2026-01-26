const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getClipboard: () => ipcRenderer.invoke('get-clipboard'),
    rephrase: (text, tone) => ipcRenderer.invoke('rephrase', text, tone),
    useText: (text, autoPaste) => ipcRenderer.invoke('use-text', text, autoPaste),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
});
