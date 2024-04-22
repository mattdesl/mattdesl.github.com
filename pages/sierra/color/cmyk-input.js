import inputC from "/assets/ColorPlate_C.png";
import inputM from "/assets/ColorPlate_M.png";
import inputY from "/assets/ColorPlate_Y.png";
import inputK from "/assets/ColorPlate_K.png";
import { readPixels, rgbaToLuma } from "../util";
import loadAsset from "load-asset";
const inputs = [inputC, inputM, inputY, inputK];

let readyCallback;
let _isReady = false;
const readyPromise = new Promise((r) => {
  readyCallback = r;
});

const targetAspect = 1448 / 2048;
export const height = 1024;
export const width = Math.floor(height * targetAspect);

export const isReady = () => _isReady;
export const ready = () => readyPromise;

export async function load() {
  // const layers = "CMYK".split("");
  if (_isReady) return readyPromise;
  console.log("Loading CMYK plates");
  const images = await Promise.all(inputs.map((f) => loadAsset(f)));
  const cmyk_u8 = new Uint8ClampedArray(width * height * 4);
  const imageDatas = images.map((i) => readPixels(i, width, height));
  for (let i = 0; i < width * height; i++) {
    const C = imageDatas[0].data[i * 4];
    const M = imageDatas[1].data[i * 4];
    const Y = imageDatas[2].data[i * 4];
    const K = imageDatas[3].data[i * 4];
    cmyk_u8[i * 4 + 0] = C;
    cmyk_u8[i * 4 + 1] = M;
    cmyk_u8[i * 4 + 2] = Y;
    cmyk_u8[i * 4 + 3] = K;
  }
  console.log("Loaded");
  _isReady = true;
  readyCallback({ width, height, data: cmyk_u8 });
  return readyPromise;
}
