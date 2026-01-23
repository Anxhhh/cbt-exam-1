const { app, BrowserWindow } = require("electron");
const path = require("path");

// Global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "StatePrep CBT – Himachal Pradesh",
    icon: path.join(__dirname, "src/assets/icons/app-icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the Vite dev server URL
  mainWindow.loadURL("http://127.0.0.1:5173");

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
