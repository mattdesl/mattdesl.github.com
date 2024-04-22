<script>
  import { onMount } from "svelte";
  import * as random from "canvas-sketch-util/random";
  import * as ColorSeparations from "../color/separations.js";
  import dotprint from "../color/dot-print.js";

  let container, canvas, context, width, height;
  const pixelRatio = window.devicePixelRatio;
  let raf, running;

  let iterator;

  const factors = {
    scale: 1,
    zoom: 1,
  };

  const scales = [1, 2, 4, 8];
  const scaleTools = [
    {
      // top: true,
      bottom: true,
      label: "",
      factor: "scale",
    },
    // {
    //   bottom: true,
    //   label: "zoom",
    //   factor: "zoom",
    // },
  ];

  $: {
    factors, load();
  }

  onMount(() => {
    context = canvas.getContext("2d");

    const resizer = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      width = r.width;
      height = r.height;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      resize();
    });
    resizer.observe(container);

    let intersector = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting) start();
      else stop();
    });
    intersector.observe(canvas);

    load();

    return () => {
      if (canvas) intersector.unobserve(canvas);
      if (container) resizer.unobserve(container);
      stop();
    };
  });

  function resize() {
    clear();
    iterator = null;
    load();
  }

  async function load() {
    const separations = await ColorSeparations.ready();
    iterator = dotprint({
      startPoint: [0.5, 0.5],
      data: separations.cmyk,
      width: separations.width,
      height: separations.height,
      scale: factors.scale,
      layer: "K",
    });
    clear();
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

  function clear() {
    context.save();
    context.scale(pixelRatio, pixelRatio);

    context.clearRect(0, 0, width, height);
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    context.restore();
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (width && height && iterator) {
      const points = [];
      const maxTicksPerFrame = 500;
      let isDone = false;
      for (let i = 0; i < maxTicksPerFrame; i++) {
        const result = iterator.next();
        if (result.value) {
          points.push(result.value);
        }
        if (result.done) {
          iterator = null;
          isDone = true;
          break;
        }
      }

      context.save();
      context.scale(pixelRatio, pixelRatio);
      context.beginPath();

      // const scaleX = width / ColorSeparations.width;
      // const scaleY = height / ColorSeparations.height;
      // const zoom = 1;
      const margin =
        0.025 * Math.min(ColorSeparations.width, ColorSeparations.height);
      const innerWidth = ColorSeparations.width - margin * 2;
      const MIN_SCALE = 1;
      const MAX_SCALE = 5;
      // let scaleFactor = 2;
      // let scaleFactor = Math.min(
      //   MAX_SCALE,
      //   Math.max(MIN_SCALE, width / innerWidth)
      // );
      // console.log(scaleFactor);

      //const zoomFactor = factors.zoom;
      const zoomFactor = width / innerWidth;
      const tx = (-ColorSeparations.width * zoomFactor) / 2 + width / 2;
      const ty = ((-ColorSeparations.height * zoomFactor) / 2 + height / 2) * 1;
      const sx = zoomFactor;
      const sy = zoomFactor;
      context.translate(tx, ty);
      context.scale(sx, sy);

      for (let p of points) {
        const proj = project(p, tx, ty, sx, sy);
        if (proj) draw(context, proj, p);
      }
      context.fillStyle = "white";
      context.fill();
      context.restore();
    }
  }

  function project({ point, radius, width: w, height: h }, tx, ty, sx, sy) {
    const [x, y] = point;
    const px = x * sx + tx;
    const py = y * sy + ty;
    if (px < 0 || py < 0 || px > width || py > height) {
      return false;
    }
    return [x, y];
  }

  function draw(context, proj, { point, radius: r, width: w, height: h }) {
    const u = (point[0] / w) * 2 - 1;
    const v = (point[1] / h) * 2 - 1;

    const radius = r;

    // const px = (point[0] / w) * width;
    // const py = (point[1] / h) * height;
    const [px, py] = proj;
    const angleFreq = 0.25;
    const angle = fractalNoise(u, v / (w / h), angleFreq, 4) * Math.PI;
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

<div class="container" bind:this={container}>
  <canvas bind:this={canvas} />
  {#each scaleTools as tool}
    <div class="tool-container" class:top={tool.top} class:bottom={tool.bottom}>
      <div class="tool" class:top={tool.top} class:bottom={tool.bottom}>
        {#if tool.label}<div class="label">{tool.label}</div>{/if}
        <div class="scales">
          {#each scales as scale}
            <div
              class="scale"
              class:active={factors[tool.factor] == scale}
              on:click={(ev) => {
                ev.preventDefault();
                factors[tool.factor] = scale;
              }}
            >
              {scale}x
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>
<div class="caption">
  try adjusting the different scale factors to simulate a different dot mesh
</div>

<style>
  .container {
    width: 100%;
    min-height: 550px;
    background: black;
    position: relative;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }

  .tool-container {
    position: absolute;
    right: 0;
    margin: auto;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    /* height: 32px; */
  }
  .bottom {
    bottom: 0;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
  }
  .top {
    top: 0;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
  }
  .tool {
    display: flex;
    justify-content: center;
    align-items: center;
    background: hsl(0, 0%, 95%);
    padding: 1rem 1rem;

    flex-direction: column;
  }
  .label {
    font-size: 12px;
    margin-bottom: 0.5rem;
  }
  .scales {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .scale {
    -webkit-user-select: none; /* Chrome/Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+ */
    -o-user-select: none;
    user-select: none;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    padding: 5px;
    background: transparent;
    font-size: 14px;
    border-radius: 100%;
    margin-right: 1rem;
    color: black;
    border: 1px dashed black;
  }
  .scale.active {
    background: black;
    color: white;
    border: 1px solid transparent;
  }
  .scale:last-child {
    margin-right: 0;
  }

  .caption {
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    padding-left: 2rem;
    padding-right: 2rem;
    align-self: flex-start;
    font-size: 11px;
    margin-top: 8px;
    font-style: italic;
  }
</style>
