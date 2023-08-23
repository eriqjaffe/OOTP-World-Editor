const { app, shell, ipcRenderer } = require('electron')

ipcRenderer.on('open-xml', (event, data) => {
    $("#loadXML").trigger("click")
});

ipcRenderer.on('save-xml', (event, data) => {
    $("#saveXML").trigger("click")
})

ipcRenderer.on('new-xml', (event, data) => {
    $("#newXML").trigger("click")
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
    $("#addRegionTrigger").trigger("click")
});

ipcRenderer.on('close-xml', (event, data) => {
    $("#closeXML").trigger("click")
})

ipcRenderer.on('about', (event, data) => {
    $("#about").trigger("click")
});

ipcRenderer.on('bulk-add-cities', (event, data) => {
    $("#bulkImportCities").trigger("click", [-1, -1, -1])
})

ipcRenderer.on('bulk-add-states', (event, data) => {
    $("#bulkImportStates").trigger("click", [-1, -1])
})

ipcRenderer.on('bulk-add-nations', (event, data) => {
    $("#bulkImportNations").trigger("click", -1)
})

ipcRenderer.on('bulk-add-continents', (event, data) => {
    $("#bulkImportContinents").trigger("click")
})

ipcRenderer.on('bulk-add-ethnicities', (event, data) => {
    $("#bulkImportEthnicities").trigger("click")
})