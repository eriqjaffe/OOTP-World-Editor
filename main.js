const { app, BrowserWindow, dialog, Menu, shell, ipcMain  } = require('electron')
const xml2js = require("xml2js");
const fs = require('fs')

const parser = new xml2js.Parser()

const isMac = process.platform === 'darwin'

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
                    parser.parseString(data, function (err, result) {
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

function createWindow () {
    const mainWindow = new BrowserWindow({
      width: 1400,
      height: 1020,
      icon: (__dirname + '/images/icon.ico'),
      webPreferences: {
          nodeIntegration: true,
            contextIsolation: false 
      }
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
		  { type: 'separator' },
          {
              click: () => mainWindow.webContents.send('save-xml','click'),
              accelerator: isMac ? 'Cmd+S' : 'Control+S',
              label: 'Save',
          },
          {
              click: () => mainWindow.webContents.send('save-xml-as','click'),
              accelerator: isMac ? 'Cmd+Shift+S' : 'Control+Shift+S',
              label: 'Save As',
          },
		  { type: 'separator' },
          isMac ? { role: 'close' } : { role: 'quit' }
          ]
      },
	  {
		  label: 'Action',
		  submenu: [
			{
				click: () => mainWindow.webContents.send('add-ethnicity','click'),
				accelerator: isMac ? 'Cmd+E' : 'Control+E',
				label: 'Add Ethnicity',
			},
			{
				click: () => mainWindow.webContents.send('add-continent','click'),
				accelerator: isMac ? 'Cmd+C' : 'Control+C',
				label: 'Add Continent',
			},
			{
				click: () => mainWindow.webContents.send('add-nation','click'),
				accelerator: isMac ? 'Cmd+N' : 'Control+N',
				label: 'Add Nation',
			},
			{
				click: () => mainWindow.webContents.send('add-state','click'),
				accelerator: isMac ? 'Cmd+T' : 'Control+T',
				label: 'Add State',
			},
			{
				click: () => mainWindow.webContents.send('add-city','click'),
				accelerator: isMac ? 'Cmd+I' : 'Control+I',
				label: 'Add City',
			},
			{
				click: () => mainWindow.webContents.send('add-region','click'),
				accelerator: isMac ? 'Cmd+R' : 'Control+R',
				label: 'Add Region',
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
                  label: 'About the OOTP Uniform Maker',
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
		  {
			  label: 'About fabric.js',
			  click: async () => {
			  await shell.openExternal('http://fabricjs.com/')
			  }
		  },
		  { type: 'separator' },
          {
              label: 'View project on GitHub',
              click: async () => {
              await shell.openExternal('https://github.com/eriqjaffe/OOTP-Uniform-Maker')
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
  
    //mainWindow.loadURL(`file://${__dirname}/index.html?port=${server.address().port}&appVersion=${pkg.version}&preferredColorFormat=${preferredColorFormat}&preferredJerseyTexture=${preferredJerseyTexture}&preferredPantsTexture=${preferredPantsTexture}&preferredCapTexture=${preferredCapTexture}&gridsVisible=${gridsVisible}&checkForUpdates=${checkForUpdates}&preferredNameFont=${preferredNameFont}&preferredNumberFont=${preferredNumberFont}&preferredCapFont=${preferredCapFont}&preferredJerseyFont=${preferredJerseyFont}&seamsVisibleOnDiffuse=${seamsVisibleOnDiffuse}&preferredHeightMapBrightness=${preferredHeightMapBrightness}&preferredSeamOpacity=${preferredSeamOpacity}&imagemagick=${imInstalled}`);

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})