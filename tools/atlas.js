const config = require('../src/config');

const path = require('path');
const fs = require('fs');
const mapLimit = require('map-limit');
const mkdirp = require('mkdirp');

const rgbHex = require('rgb-hex');
const getPalette = require('get-rgba-palette')

const Canvas = require('canvas');
const Image = Canvas.Image;
const data = require('../src/data/works.json').filter(w => w.visible !== false);
const workImageNames = data.map(d => d.name);

const tmpCanvas = new Canvas();
const tmpContext = tmpCanvas.getContext('2d');

const outputImage = path.resolve(__dirname, '../app/assets/work_thumbs.png');
const outputData = path.resolve(__dirname, '../src/data/atlas-data.json');
const mobileFolder = path.resolve(__dirname, '../app/assets/mobile');

const input = path.resolve(__dirname, '../app/assets/work');
const allImages = fs.readdirSync(input).filter(f => /\.(jpe?g|png)$/i.test(f));
const imageFiles = allImages.filter(img => {
  return workImageNames.indexOf(path.basename(img, path.extname(img))) >= 0;
}).map(f => path.resolve(input, f));

mapLimit(imageFiles, 10, (file, next) => {
  fs.readFile(file, (err, buffer) => {
    if (err) return next(err);
    const img = new Image();
    img.src = buffer;
    next(null, { image: img, name: path.basename(file, path.extname(file)) });
  });
}, (err, results) => {
  if (err) throw err;

  mkdirp(mobileFolder, err => {
    if (err) console.error(err);
    resizeImages(results);
  });

  const tileWidth = config.GRID_THUMB_WIDTH;
  const tileHeight = config.GRID_THUMB_HEIGHT;

  const columns = imageFiles.length;
  const canvas = new Canvas(columns * tileWidth, tileHeight);
  const context = canvas.getContext('2d');
  results.forEach((result, i) => {
    context.drawImage(result.image, i * tileWidth, 0, tileWidth, tileHeight);
  });

  // create our atlas JSON
  const data = results.map(r => {
    tmpCanvas.width = r.image.width;
    tmpCanvas.height = r.image.height;
    tmpContext.clearRect(0, 0, r.image.width, r.image.height);
    tmpContext.drawImage(r.image, 0, 0);
    const rgba = tmpContext.getImageData(0, 0, r.image.width, r.image.height).data;
    const palette = getPalette(rgba, 5);
    return {
      name: r.name,
      color: `#${rgbHex(...palette[0])}`
    }
  });
  fs.writeFile(outputData, JSON.stringify(data), err => {
    if (err) throw err;
  });
  fs.writeFile(outputImage, canvas.toBuffer(), err => {
    if (err) throw err;
  });
});

function resizeImages (results) {
  const tmpCanvas = new Canvas(config.GRID_LOW_WIDTH, config.GRID_LOW_HEIGHT);
  const ctx = tmpCanvas.getContext('2d');
  mapLimit(results, 1, (result, next) => {
    const image = result.image;
    ctx.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);

    var file = path.resolve(mobileFolder, `${result.name}.jpg`);
    var out = fs.createWriteStream(file);
    tmpCanvas.jpegStream({
      quality: 80,
      progressive: true
    }).pipe(out);
    out.on('error', err => next(err));
    out.on('close', () => next(null));
  }, (err) => {
    if (err) throw err;
  })
}