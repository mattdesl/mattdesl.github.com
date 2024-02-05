import * as random from "canvas-sketch-util/random";
import { clamp, inverseLerp, lerp, smoothstep } from "canvas-sketch-util/math";
import fastVariablePoisson from "./poisson-generator";

export default function* dotprint({
  data,
  width,
  height,
  layer = "C",
  scale = 1,
  invertImage = false,
} = {}) {
  const INDICES = "CMYK".split("");
  const channel = INDICES.indexOf(layer);

  const seeds = {
    C: "57388087",
    M: "16943138",
    Y: "76510726",
    K: "36318600",
  };

  const radiusScales = {
    C: 1,
    M: 1,
    Y: 1,
    K: 1.5,
  };

  const seed = seeds[layer];
  random.setSeed(seed);

  const luma = new Float32Array(width * height);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < luma.length; i++) {
    const r = data[i * 4 + channel];
    luma[i] = r / 0xff;
    max = Math.max(luma[i], max);
    min = Math.min(luma[i], min);
  }

  //  normalize
  for (let i = 0; i < luma.length; i++) {
    luma[i] = inverseLerp(min, max, luma[i]);
  }

  const fragment = (point) => {
    const u = point[0] / width;
    const v = point[1] / height;

    const px = u * width;
    const py = v * height;
    const L = sampleBilinear(luma, width, height, px, py);

    return [point, L];
  };
  const getDist = (fragment) => {
    return fragment[1];
  };

  const outputAspect = width / height;
  const columns = Math.floor(width);
  const rows = Math.ceil(columns / outputAspect);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const cellDiameter = Math.min(cellWidth, cellHeight) * scale;

  const drawLine = false;
  // const discSides = 12;

  // instead of constraining dots to the size of the cell,
  // let's exaggerate a little...
  const maxRadiusFactor = 2;

  // Final scaling factor for when drawing points
  const radiusScale = radiusScales[layer];
  // const radiusScale = 1 + 2 / 3;
  // const radiusScale = 1.5;
  // const radiusScale = Math.sqrt(Math.PI);

  const sampleRadius = cellDiameter;
  const discGenerator = fastVariablePoisson(
    [width, height],
    sampleRadius,
    sampleRadius * 2,
    40,
    [width / 2, 0],
    fragment,
    getDist,
    random.value
  );
  for (let [point, fragment] of discGenerator) {
    const L = fragment[1];
    const maxRadius = (cellDiameter / 2) * maxRadiusFactor;
    const positive = 1 - L;
    const radius = Math.min(maxRadius, maxRadius * positive);
    if (radius > 0) {
      yield {
        point,
        width,
        height,
        L,
        radius: radius * radiusScale,
      };
    }
  }
}

function sampleBilinear(data, width, height, x, y) {
  //bilinear interpolation
  //http://www.scratchapixel.com/lessons/3d-advanced-lessons/noise-part-1/creating-a-simple-2d-noise/
  var xi = Math.floor(x);
  var yi = Math.floor(y);

  var tx = x - xi;
  var ty = y - yi;

  var rx0 = clamp(xi, 0, width - 1);
  var rx1 = clamp(rx0 + 1, 0, width - 1);
  var ry0 = clamp(yi, 0, height - 1);
  var ry1 = clamp(ry0 + 1, 0, height - 1);

  /// random values at the corners of the cell using permutation table
  var c00 = data[ry0 * width + rx0];
  var c10 = data[ry0 * width + rx1];
  var c01 = data[ry1 * width + rx0];
  var c11 = data[ry1 * width + rx1];

  /// remapping of tx and ty using the Smoothstep function
  var sx = smoothstep(0, 1, tx);
  var sy = smoothstep(0, 1, ty);

  /// linearly interpolate values along the x axis
  var nx0 = lerp(c00, c10, sx);
  var nx1 = lerp(c01, c11, sx);

  /// linearly interpolate the nx0/nx1 along they y axis
  var v = lerp(nx0, nx1, sy);
  return v;
}
