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

      this.onStart(app, () => {
        if (this.onLocal) app.get('/screen', this.onLocal)
        if (this.onRemote) app.get('/config', this.onRemote)

        app.listen(port, () => {
          if (typeof (this.onStarted) === 'function') this.onStarted()
        })
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

  listDashboard (cb) {
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
}

module.exports = EnvisionModule
