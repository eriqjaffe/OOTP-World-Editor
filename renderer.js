const { app, shell, ipcRenderer } = require('electron')

ipcRenderer.on('load-uniform', (event, data) => {
    $("#loadXML").trigger("click")
});