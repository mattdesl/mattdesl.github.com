const gridHtml = `
  <figure class="grid-item">
    <a href="{{url}}" target="_blank" class="image">
      <div class="placeholder animate-out"></div>
      <div class="loader"></div>
      <div class="grid-item-overlay">
        <div class="text">
          <div class="title">{{title}}</div>
          <div class="info">{{info}}</div>
        </div>
      </div>
    </a>
  </figure>
`.trim()

const css = require('dom-css')
const domify = require('domify')
const mapLimit = require('map-limit')
const classes = require('dom-classes')
const loadImage = require('load-img')
const maxstache = require('maxstache')
const assign = require('object-assign')
const isMobile = /(iOS|iPhone|iPad|iPod|Android)/i.test(navigator.userAgent);
const isSmallScreen = window.innerWidth * window.devicePixelRatio < 900;

const createPlaceholders = require('./placeholders');
const createGrid = require('./grid')
// const demos = require('./demos')
const gridData = require('../data/works.json').filter(d => d.visible !== false);
const DEFAULT_COLS = 2

const container = document.querySelector('.work')

const noop = () => {};
const placeholders = createPlaceholders();

const gridCells = gridData.map(item => {
  item = assign({}, item);
  item.title = item.title || item.name
  item.info = (item.info || '');
  const template = maxstache(gridHtml, item);
  const el = domify(template)
  const ext = item.ext || 'jpg';
  const imageContainer = el.querySelector('.image')
  const spinner = el.querySelector('.loader')
  const placeholderElement = el.querySelector('.placeholder')
  const placeholderData = placeholders[item.name];
  if (placeholderData) {
    // have primary palette show
    el.style.backgroundColor = placeholderData.color;

    // append blur canvas
    const canvas = placeholderData.canvas;
    placeholderElement.appendChild(canvas);
    // when blur occurs, animate in the canvas
    placeholderData.onblur = () => classes.remove(placeholderElement, 'animate-out');
  }
  return {
    file: `${item.name}.${ext}`,
    element: container.appendChild(el),
    spinner: spinner,
    placeholderElement: placeholderElement,
    placeholder: placeholderData,
    imageContainer: imageContainer
  }
})

const elements = gridCells.map(cell => cell.element)

const asyncLimit = 2
mapLimit(gridCells, asyncLimit, (cell, next) => {
  imageLoader(cell, err => {
    if (err) console.error(err)
    next(null)
  })
}, () => {
  console.log('all finished')
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

function imageLoader (cell, cb) {
  const { file, element, spinner, placeholder, placeholderElement } = cell;

  const highSrc = `assets/work/${file}`
  const lowSrc = `assets/mobile/${file}`

  // somewhat dumb check here: isMobile && isDPR < 3 && window.innerWidth < X
  let src = highSrc;
  if (isMobile && isSmallScreen) {
    src = lowSrc;
  }

  classes.add(spinner, 'image-loading')
  loadImage(src, (err) => {
    // ensure placeholder will no longer appear
    placeholder.onblur = noop;
    // hide the placeholder
    classes.add(placeholderElement, 'animate-out')

    classes.remove(spinner, 'image-loading')
    if (err) return cb(err)
    classes.add(spinner, 'image-loaded')

    element.style.backgroundColor = '';
    css(element, {
      backgroundImage: `url("${src}")`,
      backgroundSize: 'cover',
      backgroundRepeat: 'none',
      backgroundPosition: 'center center'
    })
    cb(null)
  })
}
