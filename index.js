const spiderlink = require('spiderlink')('envision')
const pmx = require('pmx')
const express = require('express')
const app = express()

pmx.init({
  isModule: true
})

class EnvisionModule {
  constructor () {
    if (typeof (this.onStart) !== 'function') throw new Error('onStart must handled')
    if (typeof (this.onStop) !== 'function') throw new Error('onStop must handled')

    this.name = pmx._pmx_conf.module_name

    spiderlink.call('getModulePort', this.name, ({ err, port }) => {
      if (err && err !== 'module already exist') throw err

      this.port = port

      this.onStart(app, () => {
        if (this.onLocal) app.use('/screen', this.onLocal)
        if (this.onRemote) app.use('/config', this.onRemote)

        app.listen(port, () => {
          if (typeof (this.onStarted) === 'function') this.onStarted(port)
        })
      })
    })

    spiderlink.emitter.on('reconnect', () => {
      spiderlink.call('getModulePort', this.name, ({ err, port }) => {
        if (err && err !== 'module already exist') throw err
        if (this.port !== port) throw new Error('not same port')
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

module.exports = EnvisionModule
