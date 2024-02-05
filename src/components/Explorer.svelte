<script>
  import { afterUpdate, onMount } from "svelte";
  import load from "load-asset";
  import { lerp } from "canvas-sketch-util/math.js";
  // import * as profiles from "./color/color-profiles.js";
  // import * as cmykInput from "./color/cmyk-input.js";
  import * as ColorSeparations from "../color/separations";
  import backgroundUrl from "/assets/images/background.jpg";
  import { PLATE_COLORS } from "./constants";

  let canvas, context;

  const inputWidth = ColorSeparations.width;
  const inptuHeight = ColorSeparations.height;
  const width = inputWidth;
  const height = inptuHeight;
  let currentIterator;

  const initialSetup = {
    BG: true,
    C: true,
  };

  const masks = [["BG", "#e9e3d5"], ...PLATE_COLORS].map(
    ([name, color, foreground = "#000"]) => {
      return {
        screen: name !== "BG",
        name,
        enabled: Boolean(initialSetup[name]),
        color,
        foreground,
      };
    }
  );

  let raf;
  afterUpdate(() => {
    resetDraw();
  });

  onMount(() => {
    console.log("Mounting");
    context = canvas.getContext("2d");
    resize();
    clear();
    cancelAnimationFrame(raf);
    (async () => {
      await ColorSeparations.ready();
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
    if (!ColorSeparations.isReady()) return;
    const { profiles, cmyk, width, height } = await ColorSeparations.ready();
    // const layers = Object.entries(CMYK_mask)
    //   .filter((c) => c[1])
    //   .map((c) => c[0])
    //   .join("");
    const layers = masks
      .filter((c) => c.enabled && c.screen)
      .map((c) => c.name)
      .join("");
    currentIterator = profiles.createCMYKCompositor({
      data: cmyk,
      layers,
      width,
      height,
      context,
      premultiply: masks.find((m) => m.name === "BG").enabled,
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

  function clear() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
  }

  function resize() {
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const styleWidth = 350;
    const styleHeight = styleWidth / ColorSeparations.aspect;
    canvas.style.width = `${styleWidth}px`;
    canvas.style.height = `${styleHeight}px`;
  }
</script>

<section style="background-image: url({backgroundUrl});">
  <div class="bg-overlay"></div>
  <div class="content">
    <canvas bind:this={canvas} />
    <!-- <div class="tool">
      <div class="cmyk">
        <label
          >Background<input type="checkbox" bind:checked={premultiply} /></label
        >
        <label>C<input type="checkbox" bind:checked={CMYK_mask.C} /></label>
        <label>M<input type="checkbox" bind:checked={CMYK_mask.M} /></label>
        <label>Y<input type="checkbox" bind:checked={CMYK_mask.Y} /></label>
        <label>K<input type="checkbox" bind:checked={CMYK_mask.K} /></label>
      </div>
      <div class="info">Toggle the layers to visualize the print process.</div>
    </div> -->
    <div class="toolbox">
      {#each masks as mask, i}
        <div
          class="toggle"
          style="background: {mask.enabled
            ? mask.color
            : 'transparent'}; border-color: {mask.enabled
            ? 'transparent'
            : mask.color}; color: {mask.enabled ? '#000' : mask.color};"
          class:active={mask.enabled}
          on:click={(ev) => {
            mask.enabled = !mask.enabled;
          }}
        >
          <div class="toggle-text"></div>
        </div>
      {/each}
    </div>
    <label class="post-info"
      >Tap the color layers to toggle them, visualising the print process.</label
    >
  </div>
</section>

<style>
  canvas {
    /* border-radius: 50px; */
    /* background: linear-gradient(145deg, #f0f0f0, #cacaca); */
    box-shadow: 20px 20px 60px rgba(0, 0, 0, 0.75);
  }
  section {
    background: hsl(0, 0%, 2%);
    background-color: black;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem;
    /* background-color: white; */
    position: relative;
    color: white;
  }
  .bg-overlay {
    pointer-events: none;
    user-select: none;
    touch-action: none;
    background: black;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.75;
    width: 100%;
    height: 100%;
  }
  .content {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .toolbox {
    display: flex;
    flex-direction: row;
    margin-top: 2rem;
    justify-content: center;
    align-items: center;
  }
  .toolbox label {
    font-size: 14px;
  }
  .toggle {
    user-select: none;
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
    width: 24px;
    height: 24px;
    padding: 5px;
    background: white;
    margin-left: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    /* mix-blend-mode: screen; */
    /* border: 2px solid var(--background-color); */
    border: 1px dashed;
    cursor: pointer;
    color: white;
  }
  .toggle.active {
    opacity: 1;
    color: black;
    border: 1px solid transparent;
    /* background: transparent; */
  }
  .toggle:first-child {
    margin-left: 0;
  }
  .post-info {
    text-align: center;
    font-size: 13px;
    margin-top: 1rem;
    font-style: italic;
    opacity: 0.75;
  }
  @media screen and (max-width: 900px) {
    .post-info {
      font-size: 12px;
    }
  }
</style>
