<script>
  import { afterUpdate, onMount } from "svelte";
  import load from "load-asset";
  import { lerp } from "canvas-sketch-util/math.js";
  import * as profiles from "./color/color-profiles.js";
  import * as cmykInput from "./color/cmyk-input.js";

  let canvas, context;

  const inputWidth = cmykInput.width;
  const inptuHeight = cmykInput.height;
  const width = inputWidth;
  const height = inptuHeight;
  let pixelRatio = 1;
  let premultiply = true;
  let currentIterator;

  const CMYK_mask = {
    C: true,
    Y: true,
    M: true,
    K: true,
  };

  let raf;
  afterUpdate(() => {
    resetDraw();
  });

  onMount(() => {
    console.log("Mounting");
    context = canvas.getContext("2d");
    resize();
    cancelAnimationFrame(raf);
    (async () => {
      await cmykInput.ready();
      resetDraw();
      raf = window.requestAnimationFrame(tick);
    })();

    // cmykInput.load();
    return () => {
      console.log("Unmounting");
      cancelAnimationFrame(raf);
    };
  });

  async function resetDraw() {
    if (!cmykInput.isReady()) return;
    const { data, width, height } = await cmykInput.ready();
    const layers = Object.entries(CMYK_mask)
      .filter((c) => c[1])
      .map((c) => c[0])
      .join("");
    currentIterator = profiles.transformer({
      data,
      layers,
      width,
      height,
      context,
      premultiply,
    });
  }

  function tick() {
    raf = window.requestAnimationFrame(tick);
    if (currentIterator) {
      const result = currentIterator.next();
      if (result.value) {
        const { imageData, x, y } = result.value;
        context.putImageData(imageData, x, y);
      }
      if (result.done) {
        currentIterator = null;
      }
    }
  }

  function resize() {
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `256px`;
    canvas.style.height = `auto`;
  }
</script>

<section>
  <canvas bind:this={canvas} />
  <div class="tool">
    <div class="cmyk">
      <!-- <span>Color Plates</span> -->
      <label>C<input type="checkbox" bind:checked={CMYK_mask.C} /></label>
      <label>M<input type="checkbox" bind:checked={CMYK_mask.M} /></label>
      <label>Y<input type="checkbox" bind:checked={CMYK_mask.Y} /></label>
      <label>K<input type="checkbox" bind:checked={CMYK_mask.K} /></label>
    </div>
    <div class="premultiply">
      <label
        >Background<input type="checkbox" bind:checked={premultiply} /></label
      >
    </div>
  </div>
</section>

<style>
  section {
    display: flex;
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
