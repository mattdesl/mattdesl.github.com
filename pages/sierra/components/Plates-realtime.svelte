<script>
  import * as ColorSeparations from "../color/separations.js";

  import * as random from "canvas-sketch-util/random";
  import { afterUpdate, onMount } from "svelte";
  import dotprint from "../color/dot-print.js";
  // import * as cmykInput from "./color/cmyk-input.js";

  const MAX_CELL_WIDTH = 250;
  const MIN_CELL_WIDTH = 70;

  let imageWidth = MAX_CELL_WIDTH;
  let imageHeight = Math.round(imageWidth / ColorSeparations.aspect);

  // let imageWidth = ColorSeparations.width;
  // let imageHeight = ColorSeparations.height;
  const imagePadding = 16;
  const sidePadding = 64;

  const MIN_CONTAINER_HEIGHT =
    Math.round(MIN_CELL_WIDTH / ColorSeparations.aspect) + sidePadding * 2;

  let _currentWidth;
  let styleWidth;
  let styleHeight;

  let pixelRatio = window.devicePixelRatio;
  let maxTicksPerFrame = 500;
  let scale = "1";

  let raf;

  let layers = [];
  let container;
  let canvasC, canvasM, canvasY, canvasK;
  let running = false;

  onMount(() => {
    let observer = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting) start();
      else stop();
    });

    // let resizeObserver = new ResizeObserver((entries) => {
    //   const bounds = entries[0];
    //   const curWidth = bounds.contentRect.width;
    // });

    layers = [canvasC, canvasM, canvasY, canvasK].map((canvas, i) => {
      canvas.width = imageWidth * pixelRatio;
      canvas.height = imageHeight * pixelRatio;
      return {
        iterator: null,
        layer: "CMYK".charAt(i),
        canvas,
        context: canvas.getContext("2d"),
      };
    });
    cancelAnimationFrame(raf);
    observer.observe(container);
    // resizeObserver.observe(container);
    resize();
    load();
    clear();

    return () => {
      if (container) observer.unobserve(container);
      // if (container) resizeObserver.unobserve(container);
      stop();
    };
  });

  function resize() {
    if (!container) return;
    _currentWidth = window.innerWidth;
    const targetCellWidth =
      (_currentWidth - imagePadding * 3 - sidePadding * 2) / 4;
    const cellWidth = Math.max(
      MIN_CELL_WIDTH,
      Math.min(MAX_CELL_WIDTH, targetCellWidth)
    );
    styleWidth = cellWidth;
    styleHeight = cellWidth / ColorSeparations.aspect;
    layers.forEach((layer) => {
      layer.canvas.style.width = `${styleWidth}px`;
      layer.canvas.style.height = `${styleHeight}px`;
    });
  }

  async function load() {
    const separations = await ColorSeparations.ready();
    clear();
    layers.forEach((layer) => {
      layer.iterator = dotprint({
        data: separations.cmyk,
        width: separations.width,
        height: separations.height,
        scale: 1,
        layer: layer.layer,
      });
    });
  }

  function clear() {
    layers.forEach((layer) => {
      layer.context.save();
      layer.context.scale(pixelRatio, pixelRatio);
      layer.context.fillStyle = "black";
      layer.context.fillRect(0, 0, imageWidth, imageHeight);
      layer.context.restore();
    });
  }

  function stop() {
    cancelAnimationFrame(raf);
    running = false;
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }

  // async function resetDraw() {
  //   if (!cmykInput.isReady()) return;
  //   const { data, width, height } = await cmykInput.ready();
  //   context.clearRect(0, 0, width, height);
  //   context.fillStyle = "white";
  //   context.fillRect(0, 0, width, height);
  //   context.lineCap = "round";

  //   currentIterator = dotprint({
  //     data,
  //     width,
  //     height,
  //     scale: parseInt(scale, 10),
  //     layer: "C",
  //   });
  // }

  function tick() {
    if (!running) return;
    raf = window.requestAnimationFrame(tick);
    layers.forEach((layer) => {
      if (layer.iterator) {
        const points = [];
        let isDone = false;
        for (let i = 0; i < maxTicksPerFrame; i++) {
          const result = layer.iterator.next();
          if (result.value) points.push(result.value);
          if (result.done) {
            layer.iterator = null;
            isDone = true;
            break;
          }
        }

        layer.context.save();
        layer.context.scale(pixelRatio, pixelRatio);
        layer.context.beginPath();
        for (let p of points) {
          draw(layer.context, p);
        }
        layer.context.fillStyle = "white";
        layer.context.fill();
        layer.context.restore();
      }
    });
  }

  function draw(context, { point, radius, width, height }) {
    const u = (point[0] / width) * 2 - 1;
    const v = (point[1] / height) * 2 - 1;

    const px = (point[0] / width) * imageWidth;
    const py = (point[1] / height) * imageHeight;
    const angleFreq = 0.25;
    const angle = fractalNoise(u, v / (width / height), angleFreq, 4) * Math.PI;
    const discSides = 12;
    for (let i = 0; i < discSides; i++) {
      const t = i / discSides;
      const a = t * Math.PI * 2 + angle;
      const kx = px + Math.cos(a) * radius,
        ky = py + Math.sin(a) * radius;
      if (i == 0) context.moveTo(kx, ky);
      else context.lineTo(kx, ky);
    }
    context.closePath();
  }

  function fractalNoise(
    x,
    y,
    frequency,
    octaves,
    persistence = 0.5,
    lacunarity = 2,
    noiseRandom = random.noise2D
  ) {
    let total = 0;
    let amplitude = 1;
    let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

    for (let i = 0; i < octaves; i++) {
      total += noiseRandom(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
</script>

<svelte:window on:resize|passive={resize} />
<section
  class="plates"
  bind:this={container}
  style="padding: {sidePadding}px; min-height: {MIN_CONTAINER_HEIGHT}px;"
>
  <canvas style="margin-right: {imagePadding}px" bind:this={canvasC} />
  <canvas style="margin-right: {imagePadding}px" bind:this={canvasM} />
  <canvas style="margin-right: {imagePadding}px" bind:this={canvasY} />
  <canvas bind:this={canvasK} />
</section>

<style>
  canvas {
  }
  canvas:last-child {
    margin-right: 0;
  }
  .proof {
    width: auto;
  }
  .plates {
    overflow: hidden;
    box-sizing: border-box;
    background: white;
    color: black;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }
</style>
