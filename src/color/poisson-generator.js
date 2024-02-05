/*
Compact, variable poisson disc sampling.
This could probably be improved with speedups from below, but is sufficient for our needs.

References:
- https://www.npmjs.com/package/poisson-disk-sampling (MIT)
- https://observablehq.com/@mbostock/poisson-disk-sampling (ISC)
- https://extremelearning.com.au/an-improved-version-of-bridsons-algorithm-n-for-poisson-disc-sampling/
*/

const epsilon = 2e-14;

const neighbourhood = [
  0, 0, 0, -1, -1, 0, 1, 0, 0, 1, -1, -1, 1, -1, -1, 1, 1, 1, 0, -2, -2, 0, 2,
  0, 0, 2, -1, -2, 1, -2, -2, -1, 2, -1, -2, 1, 2, 1, -1, 2, 1, 2,
];

export default function* poisson(
  shape,
  minDistance,
  maxDistance = minDistance * 2,
  maxTries,
  startPoint,
  fragmentFunction,
  getFragmentDistance,
  rng
) {
  maxTries = Math.ceil(Math.max(1, maxTries || 30));

  let bias = 0;
  let minDistancePlusEpsilon = minDistance + epsilon;
  let deltaDistance = Math.max(0, maxDistance - minDistancePlusEpsilon);
  let dimension = 2;
  let cellSize = maxDistance / Math.sqrt(dimension);

  let processList = [];
  let samplePoints = [];

  let thisCurrentPoint,
    hasCurrentPoint,
    thisCurrentDistance = 0;

  let gridShape = [
    Math.ceil(shape[0] / cellSize),
    Math.ceil(shape[1] / cellSize),
  ];

  const newPoint = [0, 0];
  const angleToOffset = (point, out, angle, d) => {
    out[0] = point[0] + Math.cos(angle) * d;
    out[1] = point[1] + Math.sin(angle) * d;
  };

  let stride = [gridShape[1], 1];
  let grid = Array(gridShape[0] * gridShape[1])
    .fill()
    .map(() => []);

  const cache = Array(grid.length).fill();

  const directAddPoint = (point) => {
    let internalArrayIndex = 0,
      pointIndex = samplePoints.length,
      d;

    point = [point[0], point[1]];
    processList.push(pointIndex);

    for (d = 0; d < dimension; d++) {
      internalArrayIndex += ((point[d] / cellSize) | 0) * stride[d];
    }

    grid[internalArrayIndex].push(pointIndex); // store the point reference

    const frag =
      cache[internalArrayIndex] ||
      (cache[internalArrayIndex] = fragmentFunction(point));
    const sample = [point, frag, 0];
    samplePoints.push(sample);
    return sample;
  };

  const inNeighbourhood = (point, pointDistance) => {
    let neighbourIndex, internalArrayIndex, currentDimensionValue;

    for (
      neighbourIndex = 0;
      neighbourIndex < neighbourhood.length / 2;
      neighbourIndex++
    ) {
      internalArrayIndex = 0;

      for (let d = 0; d < dimension; d++) {
        currentDimensionValue =
          ((point[d] / cellSize) | 0) + neighbourhood[neighbourIndex * 2 + d];

        if (
          currentDimensionValue < 0 ||
          currentDimensionValue >= gridShape[d]
        ) {
          internalArrayIndex = -1;
          break;
        }

        internalArrayIndex += currentDimensionValue * stride[d];
      }

      if (internalArrayIndex !== -1 && grid[internalArrayIndex].length > 0) {
        for (let i = 0; i < grid[internalArrayIndex].length; i++) {
          const existingSample = samplePoints[grid[internalArrayIndex][i]];
          const existingPoint = existingSample[0];
          const existingPointDistance = getFragmentDistance(existingSample[1]);

          const curMinDistance = Math.min(existingPointDistance, pointDistance);
          const curMaxDistance = Math.max(existingPointDistance, pointDistance);
          const dist =
            curMinDistance + (curMaxDistance - curMinDistance) * bias;
          const threshold = minDistance + deltaDistance * dist;
          const dx = point[0] - existingPoint[0];
          const dy = point[1] - existingPoint[1];
          if (dx * dx + dy * dy < threshold * threshold) {
            return true;
          }
        }
      }
    }

    return false;
  };

  function next() {
    while (processList.length > 0) {
      if (!hasCurrentPoint) {
        hasCurrentPoint = true;
        const sampleIndex = processList.shift();
        const currentSample = samplePoints[sampleIndex];
        thisCurrentPoint = currentSample[0];
        thisCurrentDistance = getFragmentDistance(currentSample[1]);
      }

      for (let tries = 0; tries < maxTries; tries++) {
        const distance =
          minDistancePlusEpsilon +
          deltaDistance *
            (thisCurrentDistance + (1 - thisCurrentDistance) * bias);

        const angle = rng() * Math.PI * 2;
        angleToOffset(thisCurrentPoint, newPoint, angle, distance);

        const inShape =
          newPoint[0] >= 0 &&
          newPoint[0] < shape[0] &&
          newPoint[1] >= 0 &&
          newPoint[1] < shape[1];

        if (inShape && !inNeighbourhood(newPoint, thisCurrentDistance)) {
          const result = directAddPoint(newPoint, thisCurrentDistance);
          return result;
        }
      }

      hasCurrentPoint = false;
    }
    return null;
  }

  yield directAddPoint(startPoint);
  let r;
  while ((r = next())) {
    if (r) yield r;
  }
}
