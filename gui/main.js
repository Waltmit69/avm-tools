const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    icon: path.join(__dirname, 'src/style/img/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#0b0d17'
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  mainWindow.setMenuBarVisibility(false);

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


ipcMain.handle('save-info', async (event, data) => {
  const filePath = path.join(app.getPath('userData'), 'settings.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  } catch (error) {
    throw new Error('Failed to save information: ' + error.message);
  }
});

ipcMain.handle('get-info', async () => {
  const filePath = path.join(app.getPath('userData'), 'settings.json');
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Failed to load information:', error);
    return null;
  }
});

ipcMain.handle('open-file-dialog', async (event, options) => {
  const { dialog } = require('electron');
  return await dialog.showOpenDialog(options);
});
