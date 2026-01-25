const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getClipboard: () => ipcRenderer.invoke('get-clipboard'),
    rephrase: (text, tone) => ipcRenderer.invoke('rephrase', text, tone),
    useText: (text) => ipcRenderer.invoke('use-text', text),
    closeWindow: () => ipcRenderer.invoke('close-window'),
});
