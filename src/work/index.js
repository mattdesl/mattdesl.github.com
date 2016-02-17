const gridHtml = `
  <figure class="grid-item">
    <div class="image"></div>
    <div class="title">{{title}}</div>
  </figure>
`.trim()

const css = require('dom-css')
const domify = require('domify')
const classes = require('dom-classes')
const loadImage = require('img')
const minstache = require('minstache')

const createGrid = require('./grid')
const demos = require('./demos')
const gridData = require('../data/works.json')
const DEFAULT_COLS = 3

const container = document.querySelector('.work')

const elements = gridData.map(item => {
  item.title = item.title || item.name
  const el = domify(minstache(gridHtml, item))
  const src = `assets/work/${item.name}.jpg`
  const imageContainer = el.querySelector('.image')
  imageLoader(src, imageContainer)

  el.addEventListener('click', ev => {
    ev.preventDefault()
    demos.show(item)
  }, false)
  return container.appendChild(el)
})

const grid = createGrid(container, elements, {
  aspect: 1280 / 840,
  maxSize: [ 1000, 400 ],
  maxCellSize: [ Infinity, Infinity ],
  padding: 0,
  solve: () => {
    let count = gridData.length
    let cols = DEFAULT_COLS
    if (window.innerWidth < 480) {
      cols = 1
      grid.margin = 20
    } else if (window.innerWidth < 820) {
      cols = 2
      grid.margin = 40
    } else {
      grid.margin = 40
    }
    css(document.body, 'margin', grid.margin)
    const rows = Math.ceil(count / cols)
    return [ cols, rows ]
  }
})

grid.resize()

function imageLoader (src, element) {
  classes.add(element, 'image-loading')
  loadImage(src, (err, img) => {
    if (err) throw err
    classes.remove(element, 'image-loading')
    classes.add(element, 'image-loaded')

    css(element, {
      backgroundImage: `url("${src}")`,
      backgroundSize: 'cover',
      backgroundRepeat: 'none',
      backgroundPosition: 'center center'
    })
  })
}
