const atlasData = require('../data/atlas-data.json');
const config = require('../config');
const stackblur = require('stackblur');
const loadImage = require('load-img');
const tweenr = require('tweenr');
// const noise = new (require('simplex-noise'))();
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
    item.timeline = tweenr();
    item.tween = { value: 0 };
    dict[item.name] = item;
    return dict;
  }, {});

  // console.time('noise');
  // const noiseCanvas = document.createElement('canvas');
  // const noiseWidth = config.GRID_CANVAS_WIDTH;
  // const noiseHeight = config.GRID_CANVAS_HEIGHT;
  // noiseCanvas.width = noiseWidth;
  // noiseCanvas.height = noiseHeight;
  // const noiseContext = noiseCanvas.getContext('2d');
  // const noiseData = noiseContext.createImageData(noiseWidth, noiseHeight);
  // const pixels = noiseData.data;
  // const noiseAspect = noiseWidth / noiseHeight;

  // for (let i = 0; i < noiseWidth * noiseHeight * 4; i++) {
  //   const x = Math.floor(i % noiseWidth) / noiseWidth;
  //   const y = Math.floor(i / noiseWidth) / noiseHeight;

  //   const f = 300;
  //   const n = Math.floor(255 * (noise.noise2D(f * x, f * y / noiseAspect) * 0.5 + 0.5));
  //   const grain = n;
  //   pixels[i * 4 + 0] = grain;
  //   pixels[i * 4 + 1] = grain;
  //   pixels[i * 4 + 2] = grain;
  //   pixels[i * 4 + 3] = 255;
  // }
  // noiseContext.putImageData(noiseData, 0, 0);
  // console.timeEnd('noise');

  loadImage('assets/work_thumbs.png', (err, atlas) => {
    if (err) {
      console.warn('Could not load thumb atlas; skipping.');
      return;
    }
    // console.time('blur');
    Object.keys(images).forEach(key => {
      const item = images[key];
      const { canvas, index } = item;
      const context = canvas.getContext('2d');
      const { width, height } = canvas;
      context.drawImage(atlas, index * thumbWidth, 0, thumbWidth, thumbHeight, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      stackblur(imageData.data, width, height, 40);
      context.putImageData(imageData, 0, 0);
      // context.globalAlpha = 0.1;
      // context.globalCompositeOperation = 'darker';
      // context.drawImage(noiseCanvas, 0, 0, width, height);
      item.onblur();
    });
    // console.timeEnd('load');
  });
  return images;
};
