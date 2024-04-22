<script>
  import * as random from "canvas-sketch-util/random";
  import { afterUpdate, onMount } from "svelte";
  import load from "load-asset";
  import dotprint from "./color/dot-print.js";
  import { lerp } from "canvas-sketch-util/math.js";
  import * as profiles from "./color/color-profiles.js";
  import * as cmykInput from "./color/cmyk-input.js";

  let canvas, context;

  const inputWidth = cmykInput.width;
  const inptuHeight = cmykInput.height;
  const width = inputWidth;
  const height = inptuHeight;
  let pixelRatio = 1;
  let currentIterator;
  let maxTicksPerFrame = 1000;
  let scale = "1";

  let raf;
  afterUpdate(() => {
    resetDraw();
    console.log(scale);
  });

  onMount(() => {
    context = canvas.getContext("2d");
    resize();
    cancelAnimationFrame(raf);
    tick();
    return () => {
      cancelAnimationFrame(raf);
    };
  });

  async function resetDraw() {
    if (!cmykInput.isReady()) return;
    const { data, width, height } = await cmykInput.ready();
    context.clearRect(0, 0, width, height);
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";

    currentIterator = dotprint({
      data,
      width,
      height,
      scale: parseInt(scale, 10),
      layer: "C",
    });
  }

  function tick() {
    raf = window.requestAnimationFrame(tick);
    if (currentIterator) {
      const points = [];
      let isDone = false;
      for (let i = 0; i < maxTicksPerFrame; i++) {
        const result = currentIterator.next();
        if (result.value) points.push(result.value);
        if (result.done) {
          currentIterator = null;
          isDone = true;
          break;
        }
      }

      context.beginPath();
      for (let p of points) {
        draw(p);
      }
      context.fillStyle = "black";
      context.fill();
    }
  }

  function draw({ point, L, radius, width, height }) {
    const u = (point[0] / width) * 2 - 1;
    const v = (point[1] / height) * 2 - 1;
    const angleFreq = 0.25;
    const angle = fractalNoise(u, v / (width / height), angleFreq, 4) * Math.PI;
    const discSides = 12;
    for (let i = 0; i < discSides; i++) {
      const t = i / discSides;
      const a = t * Math.PI * 2 + angle;
      const kx = point[0] + Math.cos(a) * radius,
        ky = point[1] + Math.sin(a) * radius;
      if (i == 0) context.moveTo(kx, ky);
      else context.lineTo(kx, ky);
    }
    context.closePath();
  }

  function resize() {
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `256px`;
    canvas.style.height = `auto`;
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

<section>
  <canvas bind:this={canvas} />
  <div class="tool">
    <div class="quality">
      <span>Dot Scale</span>
      <select bind:value={scale}>
        <option value="1">1x</option>
        <option value="2">2x</option>
        <option value="4">4x</option>
        <option value="8">8x</option>
        <option value="16">16x</option>
      </select>
    </div>
    <!-- <div class="premultiply"> -->
    <!-- <label>Background<input type="checkbox" checked /></label> -->
    <!-- </div> -->
  </div>
</section>

<style>
  section {
    display: flex;
  }

  canvas {
    filter: invert();
  }

  .tool {
    /* justify-content: flex-start;
    align-items: flex-start; */
    flex-grow: 1;
    padding: 10px;
    border: 1px dashed hsl(0, 0%, 90%);
    border-radius: 5px;
    margin-left: 10px;
    /* background: hsl(0, 0%, 95%); */
  }

  .tool > div {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 10px;
  }
  .cmyk span {
    margin-right: 10px;
  }
  .tool label {
    margin-right: 10px;
    padding: 10px;
    user-select: none;
    cursor: pointer;
    background: hsl(0, 0%, 90%);
    border-radius: 10px;
  }
</style>
