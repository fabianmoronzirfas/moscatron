import { app, BrowserWindow, ipcMain as ipc } from 'electron';
import broker from './broker';
let win: BrowserWindow | null = null;
import * as path from 'path';
import * as  url from 'url';


// tslint:disable-next-line:no-var-requires
require('electron-reload')(path.join(app.getAppPath(), 'public'));

const createWindow = () => {
  win = new BrowserWindow({
    darkTheme: true,
  });
  win.loadURL(
    url.format({
      pathname: path.join(app.getAppPath(), 'public', 'index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );
  win.webContents.openDevTools();
  const mqttServer = broker();
  // console.log(mqttServer.opts);
  // Emitted when the window is closed.
  win.webContents.on('did-finish-load', () => {
    if (win !== null) {
      win.webContents.send('broker', mqttServer.opts);
      win.webContents.send('ping', 'whoooooooh!');

      mqttServer.on('subscribed', (topic, client) => {
        if (client !== undefined && win !== null) {
          const msg = `Client ${client.id} subscribed to ${topic as unknown as string}`;
          win.webContents.send('subscribed', msg);
        }
      });
      mqttServer.on('unsubscribed', (topic, client) => {
        if (client !== undefined && win !== null) {
          const msg = `Client $(client.id} unsubscribed from ${topic as unknown as string}`;
          win.webContents.send('unsubscribed', msg);

        }
      });
      mqttServer.on('clientConnected', (client: any) => {
        if (client !== undefined && win !== null) {
          const msg = `client ${client.id} connected`;
          win.webContents.send('clientConnected', msg);

        }
      });
      mqttServer.on('clientDisconnecting', (client: any) => {
        if (client !== undefined && win !== null) {
          const msg = `Client ${client.id} is disconnecting`;
          win.webContents.send('clientDisconnecting', msg);

        }
      });
      mqttServer.on('clientDisconnected', (client: any) => {
        if (client !== undefined && win !== null) {
          const msg = `Client ${client.id} has disconnected. Bye bye.`;
          win.webContents.send('clientDisconnected', msg);

        }
      });

      mqttServer.on('published', (packet, client) => {
        if (client !== undefined && win !== null) {
          const msg = `Client ${client.id}
published a message on topic
${packet.topic} ${packet.payload.toString('utf8')}`;
          win.webContents.send('published', msg);
        }
      });
    }
  });
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
    app.quit();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

ipc.on('connect', (event: any, arg: any) => {
  // tslint:disable-next-line:no-console
  console.log(`connect, event ${event} arg: ${arg}`);
});

ipc.on('disconnect', (event: any, arg: any) => {
  // tslint:disable-next-line:no-console
  console.log(`dsconnect, event ${event} arg: ${arg}`);
});
