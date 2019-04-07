var browserify = require('browserify')
var UglifyJS = require('uglify-js')
var budo = require('budo')
var fs = require('fs')
var path = require('path')
var lessStream = require('less-css-stream')
var AutoPrefix = require('less-plugin-autoprefix')
var concat = require('concat-stream')
var optimize = require('optimize-js')

var isProduction = process.env.NODE_ENV === 'production'
var isDiscify = process.env.DISCIFY === '1'
var transforms = [
  require('babelify'),
  require('loose-envify'),
  require('brfs')
]

if (isProduction || isDiscify) {
  transforms.push([ require('unassertify'), { global: true } ]);
}

if (isProduction) {
  transforms.push(
    [ require('unreachable-branch-transform'), { global: true } ]
  )
}

var entry = 'src/index.js'
var lessEntry = 'src/less/main.less'
var lessGlob = 'src/less/**/*.less'
var cssOutput = 'app/main.css'
var output = 'app/bundle.js'

if (isProduction) {
  compileLESS()

  var b = browserify(entry, {
    fullPaths: isDiscify,
    debug: false
  })
  transforms.forEach(t => b.transform(t))
  if (!isDiscify) {
    b.plugin(require('bundle-collapser/plugin'));
  }

  console.error('building', entry)
  b.bundle((err, src) => {
    if (err) return bail(err)
    console.error('compressing', entry)
  
    src = UglifyJS.minify(src.toString(), {
      compress: true,
      mangle: true,
      fromString: true
    }).code
    src = optimize(src)

    fs.writeFile(path.resolve(output), src, err => {
      if (err) return bail(err)
      console.error('finished writing', output)
    })
  })
} else {
  compileLESS()
  var app = budo(entry, {
    stream: process.stdout,
    serve: 'bundle.js',
    dir: 'app',
    browserify: { transform: transforms }
  })
    .live()
    .watch([ 'app/index.html', 'app/main.css', lessGlob ])
    .on('watch', (ev, file) => {
      if (/\.less$/i.test(file)) {
        compileLESS()
      } else {
        app.reload(file)
      }
    })
    .on('pending', () => app.reload())
}

function compileLESS () {
  var lessOpts = {
    paths: [ 'src/less/', path.dirname(require.resolve('normalize-css')) ],
    compress: isProduction,
    plugins: [ new AutoPrefix({ browsers: [ 'last 2 versions' ] }) ]
  }

  var onError = err => {
    var msg = err.message
    console.error('ERROR ' + lessEntry + ':\n  ' + msg)
  }

  fs.createReadStream(lessEntry)
    .pipe(lessStream(lessEntry, lessOpts).on('error', onError))
    .pipe(concat(body => {
      fs.writeFile(cssOutput, body, bail)
    }))
}

function bail (err) {
  if (err) {
    console.error(err.stack)
    process.exit(1)
  }
}
