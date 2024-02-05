import { writable } from "svelte/store";
import { readPixels } from "../util";
import loadAsset from "load-asset";
import ColorProfiles from "./color-profiles";

import INPUT_IMAGE_URL from "/assets/images/input.png";
import PLATE_C from "/assets/images/ColorPlate_C.png";
import PLATE_M from "/assets/images/ColorPlate_M.png";
import PLATE_Y from "/assets/images/ColorPlate_Y.png";
import PLATE_K from "/assets/images/ColorPlate_K.png";

let loading = false;
let _isReady = false;
let readyCallback;
const readyPromise = new Promise((cb) => {
  readyCallback = cb;
});

let separations;

const targetAspect = 1448 / 2048;
export const height = 1024;
export const width = Math.floor(height * targetAspect);
export const aspect = width / height;
// export const inputImageUrl = INPUT_IMAGE_URL;

export const PLATE_URLS = [PLATE_C, PLATE_M, PLATE_Y, PLATE_K];

export const isReady = () => _isReady;
export const ready = () => readyPromise;

export async function load() {
  if (loading) return readyPromise;
  loading = true;
  separations = await ColorSeparations();
  _isReady = true;
  readyCallback(separations);
  return readyPromise;
}

async function ColorSeparations(opts = {}) {
  // console.log("Loading images");
  const images = await Promise.all(PLATE_URLS.map((url) => loadAsset(url)));

  console.log("Loading profiles");
  const profiles = await ColorProfiles();

  const input = await loadAsset(INPUT_IMAGE_URL);
  const inputImageData = readPixels(input, width, height);
  const cmyk = profiles.convert_sRGBA_to_CMYK(inputImageData);

  // console.log("Reading plates");
  // const cmyk = new Uint8ClampedArray(width * height * 4);
  // const imageDatas = images.map((i) => readPixels(i, width, height));
  // for (let i = 0; i < width * height; i++) {
  //   for (let c = 0; c < 4; c++) {
  //     cmyk[i * 4 + c] = 0xff - imageDatas[c].data[i * 4];
  //   }
  // }

  return {
    // images,
    cmyk,
    profiles,
    // imageDatas,
    width,
    height,
  };
}

// function load() {
//   // const layers = "CMYK".split("");
//   if (_isReady) return readyPromise;
//   console.log("Loading CMYK plates");
//   const images = await Promise.all(inputs.map((f) => loadAsset(f)));
//   const cmyk_u8 = new Uint8ClampedArray(width * height * 4);
//   const imageDatas = images.map((i) => readPixels(i, width, height));
//   for (let i = 0; i < width * height; i++) {
//     const C = imageDatas[0].data[i * 4];
//     const M = imageDatas[1].data[i * 4];
//     const Y = imageDatas[2].data[i * 4];
//     const K = imageDatas[3].data[i * 4];
//     cmyk_u8[i * 4 + 0] = C;
//     cmyk_u8[i * 4 + 1] = M;
//     cmyk_u8[i * 4 + 2] = Y;
//     cmyk_u8[i * 4 + 3] = K;
//   }
//   console.log("Loaded");
//   _isReady = true;
//   readyCallback({ width, height, data: cmyk_u8 });
//   return readyPromise;
// }
