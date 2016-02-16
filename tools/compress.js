var through = require('through2')
module.exports = function () {
  return through.obj(function (repo, enc, next) {
    this.push({ url: repo.demo, repository: repo.html_url, name: repo.full_name })
  })
}
