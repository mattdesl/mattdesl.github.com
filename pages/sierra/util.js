export const readPixels = (() => {
  const cnv = document.createElement("canvas");
  const ctx = cnv.getContext("2d", {
    willReadFrequently: true,
  });
  return (image, width = image.naturalWidth, height = image.naturalHeight) => {
    cnv.width = width;
    cnv.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  };
})();

export const rgbaToLuma = (imageData) => {
  const { width, height, data } = imageData;
  const uint8 = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    uint8[i] = data[i * 4];
  }
  return { data: uint8, width, height };
};
