const { app, BrowserWindow, dialog, Menu, shell, ipcMain  } = require('electron')
const xml2js = require("xml2js");
const fs = require('fs')
const os = require('os')
const path = require('path')
const https = require('https')
const increment = require('add-filename-increment');
const xlsx = require('xlsx')
const { translate } = require('bing-translate-api');

const tempDir = os.tmpdir()

const parser = new xml2js.Parser()
let mainWindow;

const isMac = process.platform === 'darwin'

ipcMain.on('menu-reset', (event,arg) => {
    /* Menu.getApplicationMenu().getMenuItemById('saveMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('saveAsMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('closeXMLMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('addEthnicityMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('addContinentMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('addNationMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('addStateMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('addCityMenu').enabled = false
    Menu.getApplicationMenu().getMenuItemById('addRegionMenu').enabled = false */
})

ipcMain.on('get-elevation', (event, arg) => {
    let url = "https://api.open-elevation.com/api/v1/lookup?locations="+arg[0]+","+arg[1]
    https.get(url,(res) => {
        let body = ""
        res.on("data", (chunk) => {
            body += chunk
        })
        res.on("end", () => {
            try {
                let json = JSON.parse(body)
                json.target = arg[2]
                event.sender.send('elevation-retrieved', JSON.stringify(json))
            } catch (error) {
                console.error(error.message)
            }
        })  
    }).on("error", (error) => {
        console.error(error.message)
    })
})

ipcMain.on('get-elevation-sync', (event, arg) => {
    let url = "https://api.open-elevation.com/api/v1/lookup?locations="+arg[0]+","+arg[1]
    https.get(url,(res) => {
        let body = ""
        res.on("data", (chunk) => {
            body += chunk
        })
        res.on("end", () => {
            try {
                let json = JSON.parse(body)
                event.returnValue = json.elevation
            } catch (error) {
                event.returnValue = 0
            }
        })  
    }).on("error", (error) => {
        event.returnValue = 0
    })
})

ipcMain.on('debug-load', (event, arg) => {
    fs.readFile('.\\debug\\world_default.xml', 'utf8', function(err, data) {
        parser.parseString(data, function (err, result) {
            event.sender.send('xml-opened', JSON.stringify(result))
        })
    })
});

ipcMain.on('get-version', (event, arg) => {
    event.sender.send('version-info', app.getVersion())
})

ipcMain.on('open-xml', (event, arg) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'XML Files', extensions: ['xml'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            try {
                fs.readFile(result.filePaths[0], 'utf8', function(err, data) {
                    console.log(path.basename(result.filePaths[0]))
                    //const backup = increment(tempDir+"\\"+path.basename(result.filePaths[0]),{fs: true})
                    //fs.copyFileSync(result.filePaths[0], backup)
                    parser.parseString(data, function (err, result) {
                        /* Menu.getApplicationMenu().getMenuItemById('saveMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('saveAsMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('closeXMLMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('addEthnicityMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('addContinentMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('addNationMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('addStateMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('addCityMenu').enabled = true
                        Menu.getApplicationMenu().getMenuItemById('addRegionMenu').enabled = true */
                        event.sender.send('xml-opened', JSON.stringify(result))
                    })
                })
            } catch (err) {
                console.log(err)
                event.sender.send('xml-opened', err)
            }
        } else {
            event.sender.send('xml-opened', 'cancelled')
        }
    })
});

ipcMain.on('save_xml', (event, data) => {
    const result = {}
    var saveOptions = {
        defaultPath: ('world_default.xml'),
        filters: [
            { name: 'XML Files', extensions: ['xml'] }
        ]
    }
    dialog.showSaveDialog(null, saveOptions).then((result) => { 
        if (!result.canceled) {
            fs.writeFile(result.filePath, data, (err) => {
                if (err) {
                    result.status = "error"
                    result.message = err
                    try {
                        event.sender.send('save_xml_result', result)
                    } catch (err) {
                        console.log(err)
                    }
                    
                } else {
                    result.status = "success"
                    result.message = null
                    try {
                        event.sender.send('save_xml_result', result)
                    } catch (err) {
                        console.log(err)
                    }
                }
            });
        } else {
            result.status = "success"
            result.message = null
            try {
                event.sender.send('save_xml_result', result)
            } catch (err) {
                console.log(err)
            }
            
        }
    })
})

ipcMain.on("check-for-debug", (event, data) => { 
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools()
        event.sender.send('load-debug', null)
    } else {
        event.sender.send('open-warning', null)
    }
})

function compareHeaders(type, sheet, headerRow) {
    let expectedHeaders = null;
    switch (type) {
        case "city":
            expectedHeaders = '{"0":"Name","1":"Abbreviation","2":"Population","3":"TimeZone","4":"Capitol","5":"DST","6":"Latitude","7":"Longitude","8":"Altitude"}'
            break;
        case "state":
            expectedHeaders = '{"0":"Name","1":"Abbreviation","2":"Population","3":"TimeZone","4":"DST","5":"Latitude","6":"Longitude"}'
            break;
        case "nation":
            expectedHeaders = '{"0":"Name","1":"Abbreviation","2":"Demonym","3":"Population","4":"Gender","5":"BBQuality","6":"DST","7":"IsUSA","8":"HardcodedOrigins","9":"TimeZone"}'
            break;
        case "continent":
            expectedHeaders = '{"0":"Name","1":"Abbreviation","2":"Demonym","3":"Population"}'
            break;
        case "ethnicity":
            expectedHeaders = '{"0":"Name","1":"African","2":"Asian","3":"EastIndian","4":"Caucasian","5":"Hispanic"}'
            break;
        case "region":
            expectedHeaders = '{"0":"Name","1":"Nations","2":"States","3":"Cities"}'
            break;
        default:
            return false;
    }
    const headers = {};
    const range = xlsx.utils.decode_range(sheet['!ref']);
    let C;
    /* start in the first row */
    for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[xlsx.utils.encode_cell({ c: C, r: headerRow })];
        /* find the cell in the first row */
        let hdr = C; // <-- replace with your desired default
        if (cell && cell.t) hdr = xlsx.utils.format_cell(cell);
        headers[C] = hdr;
    }
    if (JSON.stringify(headers) == expectedHeaders) { return true } else { return false }
}

ipcMain.on("bulk-import-cities", (event, data) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'Excel or CSV files', extensions: ['xlsx', 'csv'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            let headerRow = 6
            let dataOut = {}
            try {
                if (isExcelFile(result.filePaths[0])) {
                    let workbook = xlsx.readFile(result.filePaths[0])
                    let first_sheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (compareHeaders("city", first_sheet, headerRow)) {
                        dataOut.result = "success"
                        dataOut.continent = data[0]
                        dataOut.nation = data[1]
                        dataOut.state = data[2]
                        dataOut.responseData = xlsx.utils.sheet_to_json(first_sheet, {header: 0, range: headerRow});
                        event.sender.send('bulk-city-import', JSON.stringify(dataOut))
                    } else {
                        dataOut.result = "error"
                        dataOut.errorMessage = "This does not appear to be the proper CSV file."
                        event.sender.send('bulk-city-import', JSON.stringify(dataOut))
                    }
                    
                } 
            } catch (err) {
                console.log(err)
                dataOut.result = "error"
                dataOut.errorMessage = err
                event.sender.send('bulk-city-import', JSON.stringify(dataOut))
            }
        } else {
            dataOut.result = "error"
            dataOut.errorMessage = "User Cancelled"
            event.sender.send('bulk-city-import', JSON.stringify(dataOut))
        }
    })
})

ipcMain.on("bulk-import-states", (event, data) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'Excel or CSV files', extensions: ['xlsx', 'csv'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            let dataOut = {}
            let headerRow = 5
            try {
                if (isExcelFile(result.filePaths[0])) {
                    let workbook = xlsx.readFile(result.filePaths[0])
                    let first_sheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (compareHeaders("state", first_sheet, headerRow)) {
                        dataOut.result = "success"
                        dataOut.continent = data[0]
                        dataOut.nation = data[1]
                        dataOut.responseData = xlsx.utils.sheet_to_json(first_sheet, {header: 0, range: headerRow});
                        event.sender.send('bulk-state-import', JSON.stringify(dataOut))
                    } else {
                        dataOut.result = "error"
                        dataOut.errorMessage = "This does not appear to be the proper CSV file."
                        event.sender.send('bulk-state-import', JSON.stringify(dataOut))
                    }
                } 
            } catch (err) {
                console.log(err)
                dataOut.result = "error"
                dataOut.errorMessage = err
                event.sender.send('bulk-state-import', JSON.stringify(dataOut))
            }
        } else {
            dataOut.result = "error"
            dataOut.errorMessage = "User Cancelled"
            event.sender.send('bulk-state-import', JSON.stringify(dataOut))
        }
    })
})

ipcMain.on("bulk-import-nations", (event, data) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'Excel or CSV files', extensions: ['xlsx', 'csv'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            let dataOut = {}
            let headerRow = 6
            try {
                if (isExcelFile(result.filePaths[0])) {
                    let workbook = xlsx.readFile(result.filePaths[0])
                    let first_sheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (compareHeaders("nation", first_sheet, headerRow)) {
                        dataOut.result = "success"
                        dataOut.continent = data[0]
                        dataOut.responseData = xlsx.utils.sheet_to_json(first_sheet, {header: 0, range: headerRow});
                        event.sender.send('bulk-nation-import', JSON.stringify(dataOut))
                    } else {
                        dataOut.result = "error"
                        dataOut.errorMessage = "This does not appear to be the proper CSV file."
                        event.sender.send('bulk-nation-import', JSON.stringify(dataOut))
                    }
                } 
            } catch (err) {
                console.log(err)
                dataOut.result = "error"
                dataOut.errorMessage = err
                event.sender.send('bulk-nation-import', JSON.stringify(dataOut))
            }
        } else {
            dataOut.result = "error"
            dataOut.errorMessage = "User Cancelled"
            event.sender.send('bulk-nation-import', JSON.stringify(dataOut))
        }
    })
})

ipcMain.on("bulk-import-continents", (event, data) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'Excel or CSV files', extensions: ['xlsx', 'csv'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            let dataOut = {}
            let headerRow = 0
            try {
                if (isExcelFile(result.filePaths[0])) {
                    let workbook = xlsx.readFile(result.filePaths[0])
                    let first_sheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (compareHeaders("continent", first_sheet, headerRow)) {
                        dataOut.result = "success"
                        dataOut.responseData = xlsx.utils.sheet_to_json(first_sheet, {header: 0, range: headerRow});
                        event.sender.send('bulk-continent-import', JSON.stringify(dataOut))
                    } else {
                        dataOut.result = "error"
                        dataOut.errorMessage = "This does not appear to be the proper CSV file."
                        event.sender.send('bulk-continent-import', JSON.stringify(dataOut))
                    }
                } 
            } catch (err) {
                console.log(err)
                dataOut.result = "error"
                dataOut.errorMessage = err
                event.sender.send('bulk-continent-import', JSON.stringify(dataOut))
            }
        } else {
            dataOut.result = "error"
            dataOut.errorMessage = "User Cancelled"
            event.sender.send('bulk-continent-import', JSON.stringify(dataOut))
        }
    })
})

ipcMain.on("bulk-import-ethnicities", (event, data) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'Excel or CSV files', extensions: ['xlsx', 'csv'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            let dataOut = {}
            let headerRow = 3
            try {
                if (isExcelFile(result.filePaths[0])) {
                    let workbook = xlsx.readFile(result.filePaths[0])
                    let first_sheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (compareHeaders("ethnicity", first_sheet, headerRow)) {
                        dataOut.result = "success"
                        dataOut.responseData = xlsx.utils.sheet_to_json(first_sheet, {header: 0, range: headerRow});
                        event.sender.send('bulk-ethnicity-import', JSON.stringify(dataOut))
                    } else {
                        dataOut.result = "error"
                        dataOut.errorMessage = "This does not appear to be the proper CSV file."
                        event.sender.send('bulk-ethnicity-import', JSON.stringify(dataOut))
                    }
                } 
            } catch (err) {
                console.log(err)
                dataOut.result = "error"
                dataOut.errorMessage = err
                event.sender.send('bulk-ethnicity-import', JSON.stringify(dataOut))
            }
        } else {
            dataOut.result = "error"
            dataOut.errorMessage = "User Cancelled"
            event.sender.send('bulk-ethnicity-import', JSON.stringify(dataOut))
        }
    })
})

ipcMain.on("bulk-import-regions", (event, data) => {
    const options = {
		properties: ['openFile'],
		filters: [
			{ name: 'Excel or CSV files', extensions: ['xlsx', 'csv'] }
		]
	}
    dialog.showOpenDialog(null, options).then(result => {
        if (!result.canceled) {
            let dataOut = {}
            let headerRow = 3
            try {
                if (isExcelFile(result.filePaths[0])) {
                    let workbook = xlsx.readFile(result.filePaths[0])
                    let first_sheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (compareHeaders("region", first_sheet, headerRow)) {
                        dataOut.result = "success"
                        dataOut.responseData = xlsx.utils.sheet_to_json(first_sheet, {header: 0, range: headerRow, raw: true, cellDates: false});
                        event.sender.send('bulk-region-import', JSON.stringify(dataOut))
                    } else {
                        dataOut.result = "error"
                        dataOut.errorMessage = "This does not appear to be the proper CSV file."
                        event.sender.send('bulk-region-import', JSON.stringify(dataOut))
                    }  
                } 
            } catch (err) {
                console.log(err)
                dataOut.result = "error"
                dataOut.errorMessage = err
                event.sender.send('bulk-region-import', JSON.stringify(dataOut))
            }
        } else {
            dataOut.result = "error"
            dataOut.errorMessage = "User Cancelled"
            event.sender.send('bulk-region-import', JSON.stringify(dataOut))
        }
    })
})

function isExcelFile(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      return true; // If the file can be read by xlsx, it's likely an Excel file
    } catch (error) {
      return false;
    }
}

function openTemplate(filepath) {
    let xlsx = path.join(filepath);
    let xlsxtmp = path.join(app.getPath('temp', path.basename(xlsx)))
    let tmpFile = path.join(xlsxtmp+"\\"+path.basename(xlsx))
    let ws = fs.createWriteStream(tmpFile)
    fs.createReadStream(filepath).pipe(ws)
    ws.on('finish', () => {
        shell.openPath(tmpFile);
    })
}

const template = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
        ]
    }] : []),
    {
        label: 'File',
        submenu: [
        {
            click: () => mainWindow.webContents.send('open-xml','click'),
            accelerator: isMac ? 'Cmd+O' : 'Control+O',
            label: 'Open...',
        },
        {
            click: () => mainWindow.webContents.send('new-xml','click'),
            accelerator: isMac ? 'Cmd+N' : 'Control+N',
            label: 'New...',
        },
        { type: 'separator' },
        {
            id: 'saveMenu',
            click: () => mainWindow.webContents.send('save-xml','click'),
            accelerator: isMac ? 'Cmd+S' : 'Control+S',
            label: 'Save',
            enabled: true
        },
        { type: 'separator' },
        {
            id: 'closeXMLMenu',
            click: () => mainWindow.webContents.send('close-xml','click'),
            accelerator: isMac ? 'Cmd+L' : 'Control+L',
            label: 'Close File',
            enabled: true
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    {
        label: 'Action',
        submenu: [
          {
              id: 'addContinentMenu',
              click: () => mainWindow.webContents.send('add-continent','click'),
              accelerator: isMac ? 'Cmd+Shift+C' : 'Control+Shift+C',
              label: 'Add Continent',
              enabled: true
          },
          {
              id: 'addNationMenu',
              click: () => mainWindow.webContents.send('add-nation','click'),
              accelerator: isMac ? 'Cmd+Shift+N' : 'Control+Shift+N',
              label: 'Add Nation',
              enabled: true
          },
          {
              id: 'addStateMenu',
              click: () => mainWindow.webContents.send('add-state','click'),
              accelerator: isMac ? 'Cmd+Shift+S' : 'Control+Shift+S',
              label: 'Add State',
              enabled: true
          },
          {
              id: 'addCityMenu',
              click: () => mainWindow.webContents.send('add-city','click'),
              accelerator: isMac ? 'Cmd+Shift+Y' : 'Control+Shift+Y',
              label: 'Add City',
              enabled: true
          },
          { type: 'separator' },
          {
            id: 'addEthnicityMenu',
            click: () => mainWindow.webContents.send('add-ethnicity','click'),
            accelerator: isMac ? 'Cmd+Shift+E' : 'Control+Shift+E',
            label: 'Add Ethnicity',
            enabled: true
            },
          {
              id: 'addRegionMenu',
              click: () => mainWindow.webContents.send('add-region','click'),
              accelerator: isMac ? 'Cmd+Shift+G' : 'Control+Shift+G',
              label: 'Add Region',
              enabled: true
        },
        { type: 'separator' },
        {
            label: 'Import From File',
            submenu: [
                {
                    id: 'bulkContinentMenu',
                    click: () => mainWindow.webContents.send('bulk-add-continents','click'),
                    label: 'Import Continents',
                    enabled: true
                },
                {
                    id: 'bulkNationMenu',
                    click: () => mainWindow.webContents.send('bulk-add-nations','click'),
                    label: 'Import Nations',
                    enabled: true
                },
                {
                    id: 'bulkStateMenu',
                    click: () => mainWindow.webContents.send('bulk-add-states','click'),
                    label: 'Import States',
                    enabled: true
                },
                {
                    id: 'bulkCityMenu',
                    click: () => mainWindow.webContents.send('bulk-add-cities','click'),
                    label: 'Import Cities',
                    enabled: true
                },
                { type: 'separator' },
                {
                    id: 'bulkEthnicityMenu',
                    click: () => mainWindow.webContents.send('bulk-add-ethnicities','click'),
                    label: 'Import Ethnicities',
                    enabled: true
                },
                {
                    id: 'bulkRegionMenu',
                    click: () => mainWindow.webContents.send('bulk-add-regions','click'),
                    label: 'Import Regions',
                    enabled: true
                }
            ]
        },
        { type: 'separator' },
        {
            label: 'Open Template',
            submenu: [     
                {
                    id: 'continentTemplate',
                    click: () => openTemplate(path.join(__dirname,'/files/continents_template.csv')),
                    label: 'Continents',
                    enabled: true
                },
                {
                    id: 'nationTemplate',
                    click: () => openTemplate(path.join(__dirname+"\\files\\nations_template.csv")),
                    label: 'Nations',
                    enabled: true
                },
                {
                    id: 'stateTemplate',
                    click: () => openTemplate(path.join(__dirname+"\\files\\states_template.csv")),
                    label: 'States',
                    enabled: true
                },
                {
                    id: 'cityTemplate',
                    click: () => openTemplate(path.join(__dirname+"\\files\\cities_template.csv")),
                    label: 'Cities',
                    enabled: true
                },
                { type: 'separator' },
                {
                    id: 'ethnicityTemplate',
                    click: () => openTemplate(path.join(__dirname+"\\files\\ethnicities_template.csv")),
                    label: 'Ethnicities',
                    enabled: true
                },
                {
                    id: 'regionTemplate',
                    click: () => openTemplate(path.join(__dirname+"\\files\\regions_template.csv")),
                    label: 'Regions',
                    enabled: true
                },
            ]
        },
    ]
    },
    {
        label: 'View',
        submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomin', accelerator: 'CommandOrControl+=' },
        { role: 'zoomout', accelerator: 'CommandOrControl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
        ]
    },
    {
        label: 'About',
        submenu: [
        {
            click: () => mainWindow.webContents.send('about','click'),
                label: 'About the OOTP World Editor',
        },
        {
            label: 'About OOTP Baseball',
            click: async () => {    
            await shell.openExternal('https://www.ootpdevelopments.com/out-of-the-park-baseball-home/')
            }
        },
        { type: 'separator' },
        {
            label: 'About Node.js',
            click: async () => {    
            await shell.openExternal('https://nodejs.org/en/about/')
            }
        },
        {
            label: 'About Electron',
            click: async () => {
            await shell.openExternal('https://electronjs.org')
            }
        },
        { type: 'separator' },
        {
            label: 'View project on GitHub',
            click: async () => {
            await shell.openExternal('https://github.com/eriqjaffe/OOTP-World-Editor')
            }
        },
        /* {
            click: () => mainWindow.webContents.send('update','click'),
            label: 'Check For Updates',
        } */
        ]
    }
]
    
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

app.whenReady().then(() => {

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 1020,
        icon: (__dirname + '/images/icon.ico'),
        webPreferences: {
            nodeIntegration: true,
              contextIsolation: false 
        }
      })

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})