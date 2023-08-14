const { app, BrowserWindow, dialog, Menu, shell, ipcMain  } = require('electron')
const xml2js = require("xml2js");
const fs = require('fs')
const os = require('os')
const path = require('path')
const increment = require('add-filename-increment');

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
              id: 'addEthnicityMenu',
              click: () => mainWindow.webContents.send('add-ethnicity','click'),
              accelerator: isMac ? 'Cmd+Shift+E' : 'Control+Shift+E',
              label: 'Add Ethnicity',
              enabled: true
          },
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
          {
              id: 'addRegionMenu',
              click: () => mainWindow.webContents.send('add-region','click'),
              accelerator: isMac ? 'Cmd+Shift+G' : 'Control+Shift+G',
              label: 'Add Region',
              enabled: true
          }
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
        {
            click: () => mainWindow.webContents.send('update','click'),
            label: 'Check For Updates',
        }
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

    mainWindow.webContents.openDevTools()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})