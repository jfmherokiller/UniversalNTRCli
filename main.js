const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const url = require('url')

let win

console.log("Started Program");

function createWindow () {
  win = new BrowserWindow({width: 660, height: 700})
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  
  win.setResizable(false)
  
  //Uncomment the next line to debug
  //win.webContents.openDevTools()
  
  win.dialog = dialog;
    
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})