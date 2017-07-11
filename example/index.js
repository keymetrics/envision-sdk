const EnvisionModule = require('envision-sdk')

class MonSuperModule extends EnvisionModule {
  onStart (server, cb) {
    return cb()
  }

  onStop (cb) {
    console.log('Good bye!')
    return cb()
  }

  onRemote (req, res) {
    res.send('We are on a remote client')
  }

  onLocal (req, res) {
    res.send('We are on envision dashboard')
  }
}

exports = new MonSuperModule()
