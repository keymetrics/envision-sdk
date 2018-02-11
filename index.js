
const pmx = require('pmx')
const express = require('express')
const app = express()
const WebSocket = require('ws')
const debug = require('debug')('envision:module:sdk')

class EnvisionModule {
  constructor () {
    this.stack = []

    if (typeof (this.onStart) !== 'function') throw new Error('onStart must handled')
    if (typeof (this.onStop) !== 'function') throw new Error('onStop must handled')

    this.name = pmx._pmx_conf.module_name
    this.connectEnvision()
  }

  connectEnvision () {
    this.ws = new WebSocket(`ws+unix://${process.env.HOME}/envision-${this.name}`)

    this.json = (obj) => this.ws.send(JSON.stringify(obj))

    this.ws.on('open', () => {
      this.json({ action: 'getModuleInfos' })
    })

    this.ws.on('error', (err) => {
      console.error(err)
    })

    this.ws.on('close', () => {
      this.onStop(() => {
        if (this.server) this.server.close()
        setTimeout(this.connectEnvision.bind(this), 1000)
      })
    })

    this.ws.on('message', msg => {
      try {
        msg = JSON.parse(msg)
      } catch (error) {
        return
      }
      let data = msg.data

      switch (msg.action) {
        case 'ping':
          this.json({action : 'pong' })
          break
        case 'sendModuleInfos':
          if (data.err) throw new Error(data.err)

          this.port = data.port

          this.onStart(app, () => {
            if (this.onLocal) app.use('/screen', this.onLocal)
            if (this.onRemote) app.use('/config', this.onRemote)

            this.server = app.listen(this.port, () => {
              if (typeof (this.onStarted) === 'function') this.onStarted(this.port)
              // Send ACK that module is listening and ready
              this.json({
                action : 'moduleReady'
              })
            })
          })
          break
        default:
          if (typeof this.stack[msg.action] === 'function') {
            this.stack[msg.action](msg.data)
          }
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
      action: 'getDashboards'
    })
    this.stack['sendDashboards'] = cb
  }

  getModules (cb) {
    this.json({
      action: 'getModules'
    })
    this.stack['sendModules'] = cb
  }

  getDashboardInfos (cb) {
    this.json({
      action: 'getDashboardInfos'
    })
    this.stack['sendDashboardInfos'] = cb
  }

  pushNotification (type, text) {
    this.json({
      action: 'pushNotification',
      data: { type, text }
    })
  }
}

module.exports = EnvisionModule
