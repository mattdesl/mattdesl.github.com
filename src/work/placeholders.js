const atlasData = require('../data/atlas-data.json');
const config = require('../config');
const stackblur = require('stackblur');
const loadImage = require('load-img');

const thumbWidth = config.GRID_THUMB_WIDTH;
const thumbHeight = config.GRID_THUMB_HEIGHT;

module.exports = function () {
  const images = atlasData.reduce((dict, item, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.GRID_CANVAS_WIDTH;
    canvas.height = config.GRID_CANVAS_HEIGHT;

    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    item.canvas = canvas;
    item.index = index;
    item.onblur = () => {};
    dict[item.name] = item;
    return dict;
  }, {});

  loadImage('assets/work_thumbs.png', (err, atlas) => {
    if (err) {
      console.warn('Could not load thumb atlas; skipping.');
      return;
    }
    Object.keys(images).forEach(key => {
      const item = images[key];
      const { canvas, index } = item;
      const context = canvas.getContext('2d');
      const { width, height } = canvas;
      context.drawImage(atlas, index * thumbWidth, 0, thumbWidth, thumbHeight, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      stackblur(imageData.data, width, height, 40);
      context.putImageData(imageData, 0, 0);
      item.onblur();
    });
  })
  return images;
};
