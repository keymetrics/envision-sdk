const spiderlink = require('spiderlink')('envision')
const pmx = require('pmx')
const express = require('express')
const app = express()
const fs = require('fs')
const WebSocket = require('ws');

class EnvisionModuleV1 {
  constructor () {
    if (typeof (this.onStart) !== 'function') throw new Error('onStart must handled')
    if (typeof (this.onStop) !== 'function') throw new Error('onStop must handled')

    this.name = pmx._pmx_conf.module_name

    spiderlink.call('getModuleInfos', this.name, (module) => {
      if (module.err) throw new Error(module.err);

      this.port = module.port;

      this.onStart(app, () => {
        if (this.onLocal) app.use('/screen', this.onLocal)
        if (this.onRemote) app.use('/config', this.onRemote)

        console.log('Module listening on port ' + this.port);
        app.listen(this.port, () => {
          if (typeof (this.onStarted) === 'function') this.onStarted(this.port)
        })
      })
    })

    spiderlink.emitter.on('reconnect', () => {
      spiderlink.call('getModulePort', this.name, (module) => {
        if (module.err) throw new Error(module.err);
        if (this.port !== module.port) throw new Error('not same port')
      })
    })

    if (typeof (this.onDashboard) === 'function') {
      spiderlink.subscribe('envision:newDashboard', infos => {
        this.onDashboard(infos)
      })
    }
  }

  setDashboardUrl (url) {
    spiderlink.call('setDashboardUrl', url, () => {})
  }

  getDashboards (cb) {
    spiderlink.call('listDashboards', dashboards => {
      return cb(dashboards)
    })
  }

  getModules (cb) {
    spiderlink.call('getModules', ({ err, modules }) => {
      if (err) throw err

      return cb(modules)
    })
  }

  getDashboardInfos (cb) {
    spiderlink.call('getDashboardInfos', infos => {
      return cb(infos)
    })
  }

  pushNotification (type, text, cb) {
    spiderlink.call('pushNotification', { type, text }, () => {
      return cb()
    })
  }
}

class EnvisionModule {
  constructor () {
    if (typeof (this.onStart) !== 'function') throw new Error('onStart must handled')
    if (typeof (this.onStop) !== 'function') throw new Error('onStop must handled')

    this.name = pmx._pmx_conf.module_name
    this.ws = new WebSocket(`unix+ws://${process.env.HOME}/envision`)
    this.json = (obj) => this.ws.send(JSON.stringify(obj))

    this.ws.on('open', () => {
      this.json({ action: 'getModuleInfos' })
    });

    this.ws.on('message', msg => {
      try {
        msg = JSON.parse(msg)
      } catch (error) {
        return
      }

      switch (msg.action) {
        case 'sendModuleInfos':
          if (module.err) throw new Error(module.err);

          this.port = module.port;
    
          this.onStart(app, () => {
            if (this.onLocal) app.use('/screen', this.onLocal)
            if (this.onRemote) app.use('/config', this.onRemote)
    
            console.log('Module listening on port ' + this.port);
            app.listen(this.port, () => {
              if (typeof (this.onStarted) === 'function') this.onStarted(this.port)
            })
          })
          break
        default:
          break
      }
    })
  }

  setDashboardUrl (url) {
    this.json({
      action: 'setDashboardUrl', 
      data: {
        url
      }
    })
  }

  getDashboards (cb) {
    this.json({
      action: 'setDashboardUrl', 
      data: {
        url
      }
    })
    spiderlink.call('listDashboards', dashboards => {
      return cb(dashboards)
    })
  }

  getModules (cb) {
    spiderlink.call('getModules', ({ err, modules }) => {
      if (err) throw err

      return cb(modules)
    })
  }

  getDashboardInfos (cb) {
    spiderlink.call('getDashboardInfos', infos => {
      return cb(infos)
    })
  }

  pushNotification (type, text, cb) {
    spiderlink.call('pushNotification', { type, text }, () => {
      return cb()
    })
  }
}

if (!fs.existsSync(path.join(process.env.HOME, 'envision'))) {
  module.exports = EnvisionModuleV1
  return 
}

module.exports = EnvisionModule
