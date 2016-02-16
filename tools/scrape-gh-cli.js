var argv = require('minimist')(process.argv.slice(2))
var scrapeGhDemos = require('./scrape-gh')
var ghAuth = require('ghauth')
var path = require('path')
var fs = require('fs')
var stringify = require('JSONStream').stringify
var through = require('through2')
var mapStream = require('map-stream')

ghAuth({
  configName: 'portfolios',
  scopes: ['user', 'repo']
}, (err, data) => {
  if (err) throw err

  if (argv.defaults) {
    var defFile = path.isAbsolute(argv.defaults)
      ? argv.defaults
      : path.resolve(process.cwd(), argv.defaults)
    argv.defaults = JSON.parse(fs.readFileSync(defFile, 'utf8'))
  }

  argv.token = data.token
  scrapeGhDemos(argv._, argv)
    .on('data', repo => {
      if (!repo.demo) {
        console.error('skip  =>', repo.full_name)
      }
    })
    .pipe(mapStream(filter))
    .pipe(argv.bare ? bareRepo() : through.obj())
    .pipe(stringify())
    .pipe(process.stdout)

  function filter (item, next) {
    if (argv.bare && !item.demo) return next()
    return next(null, item)
  }

  function bareRepo () {
    return through.obj(function (repo, enc, next) {
      this.push({ url: repo.demo, repository: repo.html_url, name: repo.name })
      next()
    })
  }
})
