# envision-sdk
Envision SDK

## Getting started

### package.json

You can put informations in your package.json, will be used for marketplace interface in Envision

```json
{
  "name": "envision-nes",
  "author": "Florian H-J",
  "main": "index.js",
  "envision": {
    "name": "NES Emulator",
    "icon": "https://upload.wikimedia.org/wikipedia/commons/3/30/Nes_controller.svg",
    "category": "games",
    "description": "Emulator of Nintendo NES, controllable from any computer (WS remote) to play with 2 colleagues.",
    "screen": true,
    "config": true
  }
}
```

### index.js

Your main file, specified in `package.json`

```js
const EnvisionModule = require('envision-sdk')

class MonSuperModule extends EnvisionModule {

  /*
    Functions needed for starting
  */

  // Called when module is initialized, by envision start or installing
  onStart (server, cb) {
    //server is `express()`, you can handle other routes if needed
    return cb()
  }


  // Called when dashboard is stopped or system shutdown
  onStop (cb) {
    console.log('Good bye!')
    return cb()
  }


  /*
    Express handler, refer to https://expressjs.com/en/4x/api.html for API
  */

  // Route for settings (on your computer)
  onRemote (req, res) {
    res.send('We are on a remote client')
  }

  // Route for envision system, displayed on screen
  onLocal (req, res) {
    res.send('We are on envision dashboard')
  }
}

exports = new MonSuperModule()
```

### Serve static files
You can override express functions
```js
const express = require('express')

class MonSuperModule extends EnvisionModule {
  onStart (server, cb) {
    this.onRemote = express.static('remote')
    cb()
  }
}
```

### Add routes
Example with `POST` upload route for remote configuration

```js
const remoteRouter = express.Router()

var upload = multer({ dest: process.env.HOME + '/' })

remoteRouter.get('/', (req, res) => {
  res.sendFile(__dirname + '/remote.html')
})

remoteRouter.post('/upload', upload.single('file'), function(req, res) {
  let source = fs.createReadStream(req.file.path)
  let destination = fs.createWriteStream(process.env.HOME + '/video.mp4')

  source.pipe(destination, { end: false });
  source.on("end", function(){
      fs.unlinkSync(req.file.path)
      res.send('Good!')
  })
})

class MonSuperModule extends EnvisionModule {
  onStart (server, cb) {
    console.log('started')
    this.onRemote = remoteRouter
    return cb()
  }
}
```

## API
EnvisionModule contains API to make some actions on Envision

### setDashboardUrl

Can set Envision interface to a specific URL

Example:
```js
this.setDashboardUrl('https://keymetrics.io/')
```

### getDashboards

List all dashboards in your internal networks
NB: development and production dashboards are separated.

Example:
```js
this.getDashboards(dashboards => {
  dashboards = [
    {
      "port": 3110,
      "host": "192.168.0.138",
      "infos": {
        "ip": "192.168.0.138",
        "config": {
          "env": "development",
          "api_port": 3200,
          "discovery_name": "pxx-xncs-xs",
          "config_path": "/tmp",
          "interval_check_internet": 1000,
          "default": "envision",
          "interval_online_dashboard": 1000,
          "interval_lookup_dashboard": 1000,
          "connection_tentatives": 3
        },
        "version": "0.2.34",
        "hostname": "florian-debian",
        "name": "florian-debian",
        "uptime": 417300
      }
    }
  ]

})
```

### getModules

List all modules installed in current Envision system

Example:
```js
this.getModules(modules => {
  modules = [
    {
      "id": "envision-nes",
      "name": "NES Emulator",
      "icon": "https://upload.wikimedia.org/wikipedia/commons/3/30/Nes_controller.svg",
      "author": {
        "name": "Florian H-J"
      },
      "version": "1.0.9",
      "category": "games",
      "description": "Emulator of Nintendo NES, controllable from any computer (WS remote) to play with 2 colleagues.",
      "screen": true,
      "config": true,
      "status": "online",
      "linked": true
    }
  ]

})
```

### getDashboardInfos

Get current informations about current Envision system

Example:
```js
this.getDashboardInfos(infos => {
  infos = {
    "ip": "192.168.0.138",
    "version": "0.2.34",
    "hostname": "florian-debian",
    "name": "florian-debian",
    "uptime": 417803
  }
})
```

### pushNotification

Send notification to Envision interface
NB: if sound is at 0%, notification sound is not played

Example:
```js
this.pushNotification('confirm', 'Success!', () => {
  console.log('Notification sent')
})
```
