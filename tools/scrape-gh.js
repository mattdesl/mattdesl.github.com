// Scrapes GitHub author for data
var ghApiStream = require('gh-api-stream')
var ghApi = require('gh-api')
var got = require('got')
var through = require('through2')
var mapStream = require('map-stream')
var async = require('async')

module.exports = findGitHubDemos
function findGitHubDemos (users, opt, cb) {
  var type = opt.type ? opt.type : 'public'
  var defaults = {}

  var stream = streamRepos(users)
    .pipe(mapStream(mapFilter))
    .pipe(through.obj(write))

  return stream

  function streamRepos (users) {
    var stream = through.obj()

    async.eachSeries(users, (user, next) => {
      console.error('--> ' + user)
      ghApiStream('/users/' + user + '/repos', {
        query: {
          type: type
        },
        token: opt.token,
        pages: opt.pages,
        rows: true
      })
        .on('error', err => next(err))
        .on('data', data => stream.push(data))
        .on('end', () => next())
    }, (err) => {
      if (err) stream.emit('error', err)
      stream.end()
    })

    return stream
  }

  function mapFilter (repo, next) {
    if (repo.full_name in defaults && typeof defaults[repo.full_name] !== 'string') {
      return next() // user wants to drop this entry
    }
    if (!repo.has_pages) return next()
    if (repo.fork) return next()

    if (opt.user && repo.owner.login !== opt.user) {
      var contribUrl = '/repos/' + repo.owner.login + '/' + repo.name + '/contributors'
      ghApi(contribUrl, {
        token: opt.token
      }, (err, contributors, resp) => {
        if (err) return next(err)
        if (!Array.isArray(contributors)) {
          return next(new Error(contributors.message))
        }
        contributors.sort((a, b) => b.contributions - a.contributions)

        if (contributors.length && contributors[0].login === opt.user) {
          next(null, repo)
        } else {
          next() // drop entry
        }
      })
    } else {
      next(null, repo)
    }
  }

  function write (repo, enc, next) {
    var homepage
    if (repo.full_name in defaults) {
      homepage = defaults[repo.full_name]
    } else {
      homepage = repo.homepage
    }

    if (homepage) {
      repo.demo = homepage
      // console.error('found =>', repo.full_name)
      this.push(repo)
      return next()
    } else {
      findDemoPage(this, repo, next)
    }
  }

  function findDemoPage (stream, repo, next) {
    var baseUrl = 'http://' + repo.owner.login + '.github.io/' + repo.name + '/'
    var urls = [
      baseUrl,
      baseUrl + 'demo/',
      baseUrl + 'example/'
    ]
    async.detectSeries(urls, (url, cb) => {
      got.head(url)
        .then(() => cb(true), () => cb(false))
    }, (found) => {
      if (found) {
        repo.demo = found
        stream.push(repo)
      } else {
        repo.demo = null
        stream.push(repo)
      }
      next()
    })
  }
}
