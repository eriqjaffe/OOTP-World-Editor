const { app, shell, ipcRenderer } = require('electron')

ipcRenderer.on('open-xml', (event, data) => {
    $("#loadXML").trigger("click")
});

ipcRenderer.on('save-xml', (event, data) => {
    $("#saveXML").trigger("click")
})

ipcRenderer.on('add-ethnicity', (event, data) => {
    $("#addEthnicityTrigger").trigger("click")
});

ipcRenderer.on('add-continent', (event, data) => {
    $("#addContinentTrigger").trigger("click")
});

ipcRenderer.on('add-nation', (event, data) => {
    addNation(null)
});

ipcRenderer.on('add-state', (event, data) => {
    addState(null, null)
});

ipcRenderer.on('add-city', (event, data) => {
    addCity(null, null, null)
});

ipcRenderer.on('add-region', (event, data) => {
    rightDivContent("#addRegion")
});

ipcRenderer.on('close-xml', (event, data) => {
    $("#closeXML").trigger("click")
})