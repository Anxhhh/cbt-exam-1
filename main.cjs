const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "StatePrep CBT – Himachal Pradesh",
    icon: path.join(__dirname, "src/assets/icons/app-icon.png")
  });

  win.loadURL("http://127.0.0.1:5173");
}

app.whenReady().then(createWindow);
