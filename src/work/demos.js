const css = require('dom-css')
const createTimeline = require('tweenr')

const tweenOpt = {
  defaultEase: 'expoOut'
}

const containerTimeline = createTimeline(tweenOpt)
const closeTimeline = createTimeline(tweenOpt)

const iconContainer = document.querySelector('.icons')
const demoContainer = document.querySelector('.demo-container')
const demoClose = document.querySelector('.icon-close')
const demoLink = document.querySelector('.icon-link')
const icons = [ demoClose, demoLink ]

let currentDemo
const tweenTarget = { value: 0, z: 0 }

const closer = createCloseController()

demoClose.addEventListener('click', ev => {
  module.exports.hide()
}, false)

module.exports.show = show
function show (item) {
  if (currentDemo) return

  var iframe = document.createElement('iframe')
  currentDemo = iframe
  demoLink.setAttribute('href', item.repository)

  demoContainer.insertBefore(iframe, demoContainer.firstChild)
  css(document.body, 'overflow', 'hidden') // lock scroll
  css(iframe, 'visibility', 'hidden') // hide content
  css(iconContainer, 'color', item.dark ? 'white' : 'black')
  css(iframe, 'background', item.dark ? 'black' : 'white')
  css(demoContainer, 'display', 'block') // show fill

  containerTimeline.cancel()
  const tween = containerTimeline.to(tweenTarget, {
    value: 1,
    z: 1,
    duration: 0.25
  }).on('update', updateContainer)
    .on('cancelling', () => tween.removeAllListeners('complete'))
    .on('complete', () => {
      iframe.onload = () => {
        setTimeout(() => closer.show(), 150)
        css(iframe, 'visibility', 'visible')
        console.log('laoded')
      }
      iframe.onerror = () => {
        console.error('could not load')
        module.exports.hide()
      }
      iframe.src = item.url
    })
}

module.exports.hide = hide
function hide () {
  if (!currentDemo) return

  css(document.body, 'overflow', '') // unlock scroll
  demoLink.setAttribute('href', '')

  closer.hide()
  containerTimeline.cancel()
  const tween = containerTimeline.to(tweenTarget, {
    value: 0,
    z: 0,
    duration: 0.25
  }).on('update', updateContainer)
    .on('cancelling', () => tween.removeAllListeners('complete'))
    .on('complete', () => {
      currentDemo.parentNode.removeChild(currentDemo)
      currentDemo = null
      css(demoContainer, 'display', 'none')
    })
}

function updateContainer (ev) {
  const { target } = ev
  const { value } = target
  css(demoContainer, 'height', `${Math.round(value * 100)}%`)
}

function createCloseController () {
  const target = { value: 0 }
  return {
    show () {
      css(iconContainer, 'display', 'block')
      closeTimeline.cancel().to(target, {
        duration: 0.5,
        value: 1
      }).on('update', update)
    },

    hide () {
      closeTimeline.cancel().to(target, {
        duration: 0.25,
        value: 0
      }).on('update', update)
        .on('complete', () => css(iconContainer, 'display', 'none'))
    }
  }

  function update () {
    icons.forEach(el => css(el, 'opacity', target.value))
  }
}
