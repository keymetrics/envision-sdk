const spiderlink = require('spiderlink')('envision')
const pmx = require('pmx')

pmx.init({
  isModule: true
})

class EnvisionModule {
  constructor () {
    console.log(pmx._pmx_conf)
    spiderlink.call('getModulePort', '', ({ err, data }) => {
      if (err) throw err

      console.log('--- DATA ---')
      console.log(data)
    })
  }
}

module.exports = EnvisionModule
