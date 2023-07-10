const { app, shell, ipcRenderer } = require('electron')

ipcRenderer.on('open-xml', (event, data) => {
    $("#loadXML").trigger("click")
});

ipcRenderer.on('add-ethnicity', (event, data) => {
    $("#addEthnicityTrigger").trigger("click")
});

ipcRenderer.on('add-continent', (event, data) => {
    $("#addContinentTrigger").trigger("click")
});

ipcRenderer.on('add-nation', (event, data) => {
    $("#addNationTrigger").trigger("click")
});

ipcRenderer.on('add-state', (event, data) => {
    $("#addStateTrigger").trigger("click")
});

ipcRenderer.on('add-city', (event, data) => {
    $("#addCityTrigger").trigger("click")
});

ipcRenderer.on('add-region', (event, data) => {
    $("#addRegionTrigger").trigger("click")
});

ipcRenderer.on('close-xml', (event, data) => {
    $("#closeXML").trigger("click")
})