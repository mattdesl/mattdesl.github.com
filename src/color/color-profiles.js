import uri_CMYK from "/assets/profiles/U.S. Web Coated (SWOP) v2.icc?url";
import uri_sRGB from "/assets/profiles/sRGB IEC61966-2.1.icc?url";
import {
  instantiate,
  INTENT_RELATIVE_COLORIMETRIC,
  cmsFLAGS_NOCACHE,
  cmsFLAGS_HIGHRESPRECALC,
  cmsFLAGS_NOOPTIMIZE,
  cmsFLAGS_BLACKPOINTCOMPENSATION,
  cmsInfoDescription,
} from "../lcms/lcms.js";

const BLACK_POINT_COMPENSATION = true;
const IS_FLOAT = false;
const INTENT = INTENT_RELATIVE_COLORIMETRIC;

const MAX_BUFFER_SIZE = 1024 * 1024;
const MAX_ROWS_PER_TRANSFORM = 64;

const BACKGROUND_RGB = [233, 227, 213];

export default async function ColorProfiles() {
  console.log("Loading LCMS...");
  const lcms = await instantiate();

  let profile_sRGB = await loadProfile(uri_sRGB);
  let profile_CMYK = await loadProfile(uri_CMYK);

  const transform_CMYK_to_sRGB = createTransform(profile_CMYK, profile_sRGB);
  const transform_sRGB_to_CMYK = createTransform(profile_sRGB, profile_CMYK);
  lcms.cmsCloseProfile(profile_sRGB);
  lcms.cmsCloseProfile(profile_CMYK);

  return {
    createCMYKCompositor,
    convert_sRGBA_to_CMYK,
    dispose,
  };

  function dispose() {
    lcms.cmsDeleteTransform(transform_CMYK_to_sRGB);
    lcms.cmsDeleteTransform(transform_sRGB_to_CMYK);
    profile_sRGB = null;
    profile_CMYK = null;
  }

  function createTransform(inputProfile, outputProfile) {
    let flags =
      cmsFLAGS_NOCACHE | cmsFLAGS_HIGHRESPRECALC | cmsFLAGS_NOOPTIMIZE;
    if (BLACK_POINT_COMPENSATION) {
      flags |= cmsFLAGS_BLACKPOINTCOMPENSATION;
    }

    const inputFormat = lcms.cmsFormatterForColorspaceOfProfile(
      inputProfile,
      IS_FLOAT ? 4 : 1,
      IS_FLOAT
    );
    const outputFormat = lcms.cmsFormatterForColorspaceOfProfile(
      outputProfile,
      IS_FLOAT ? 4 : 1,
      IS_FLOAT
    );
    return lcms.cmsCreateTransform(
      inputProfile,
      inputFormat,
      outputProfile,
      outputFormat,
      INTENT,
      flags
    );
  }

  async function loadProfile(url) {
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    const profile = lcms.cmsOpenProfileFromMem(
      new Uint8Array(buf),
      buf.byteLength
    );
    if (!profile) throw new Error(`could not open profile ${url}`);
    console.log(`Loaded color profile ${getProfileName(profile)}`);
    return profile;
  }

  function getProfileName(profile) {
    return lcms.cmsGetProfileInfoASCII(profile, cmsInfoDescription, "en", "US");
  }

  // Converts an entire RGBA imageData to CMYK plates in uint8array format
  function convert_sRGBA_to_CMYK(imageData) {
    const { data, width, height } = imageData;
    console.time("transform");
    const channels = 3;
    const nPixels = width * height;
    const rgbBuffer = new Uint8ClampedArray(channels * nPixels);
    for (let i = 0; i < nPixels; i++) {
      for (let c = 0; c < channels; c++) {
        const component = data[i * 4 + c];
        rgbBuffer[i * channels + c] = component;
      }
    }
    const result = lcms.cmsDoTransform(
      transform_sRGB_to_CMYK,
      rgbBuffer,
      nPixels
    );
    for (let i = 0; i < result.length; i++) {
      const c = result[i];
      result[i] = 0xff - c;
    }
    console.timeEnd("transform");
    return result;
  }

  function* createCMYKCompositor(opts = {}) {
    const {
      data,
      width,
      height,
      context,
      layers = "CMYK",
      invert = false,
      premultiply = false,
    } = opts;

    // Calculate the number of rows to scan at a time based on available buffer space
    // const rowsPerTransform = 4;
    const rowsPerTransform = Math.min(
      height,
      MAX_ROWS_PER_TRANSFORM,
      Math.floor(MAX_BUFFER_SIZE / width)
    );
    console.log("Total pixels", width * height);
    console.log("Total rowsPerTransform", rowsPerTransform);
    console.log("Total blit count", height / rowsPerTransform);

    const PLATES = "CMYK".split("");
    const channelMasks = PLATES.map((c) => layers.toUpperCase().includes(c));

    for (let y = 0; y < height; y += rowsPerTransform) {
      const x = 0;
      const startIndex = x + y * width;
      const endIndex = Math.min(
        width * height,
        startIndex + width * rowsPerTransform
      );
      const regionWidth = width;
      const regionHeight = (endIndex - startIndex) / width;
      if (regionHeight % 1 != 0) throw new Error("expected whole number");

      const channels = 4;
      const nPixels = regionWidth * regionHeight;
      const buffer = new Uint8ClampedArray(nPixels * channels);
      for (let i = 0; i < nPixels; i++) {
        const idx = (i + startIndex) * 4;
        const idxOut = i * 4;
        for (let c = 0; c < channels; c++) {
          const uint8Value = data[idx + c];
          buffer[idxOut + c] = (0xff - uint8Value) * (channelMasks[c] ? 1 : 0);
        }
      }

      const result = lcms.cmsDoTransform(
        transform_CMYK_to_sRGB,
        buffer,
        nPixels
      );
      const imageData = context.createImageData(regionWidth, regionHeight);
      const rgba = imageData.data;
      for (let i = 0; i < nPixels; i++) {
        let r = Math.round(result[i * 3 + 0]);
        let g = Math.round(result[i * 3 + 1]);
        let b = Math.round(result[i * 3 + 2]);
        if (premultiply) {
          r = blendMultiply(r, BACKGROUND_RGB[0]);
          g = blendMultiply(g, BACKGROUND_RGB[1]);
          b = blendMultiply(b, BACKGROUND_RGB[2]);
        }
        rgba[i * 4 + 0] = r;
        rgba[i * 4 + 1] = g;
        rgba[i * 4 + 2] = b;
        rgba[i * 4 + 3] = 0xff;
      }
      yield { imageData, x, y };
    }
  }
}

function roundByte(n) {
  return Math.max(0, Math.min(0xff, Math.round(n)));
}

function blendMultiply(a, b) {
  return roundByte((a / 0xff) * (b / 0xff) * 0xff);
}

function composite(rgb1, rgb2, alphaByte) {
  const alpha = Math.max(0, Math.min(1, alphaByte / 0xff));

  // Decompose the two colors into their red, green, and blue components
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;

  // Perform the blending
  // background.rgba * (1.0 - alpha) + (foreground.rgba * alpha);
  let r = r1 * (1 - alpha) + r2 * alpha;
  let g = g1 * (1 - alpha) + g2 * alpha;
  let b = b1 * (1 - alpha) + b2 * alpha;

  // Combine the blended components back into a single color
  return [r, g, b].map((n) => roundByte(n));
}
