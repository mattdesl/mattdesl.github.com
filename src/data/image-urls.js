const fs = require('fs')
const images = fs.readdirSync(__dirname + '/../../app/assets/work')

module.exports = images.filter(x => /\.(png|jpe?g|gif)/i.test(x))
