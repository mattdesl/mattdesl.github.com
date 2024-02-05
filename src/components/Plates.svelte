<script>
  import * as ColorSeparations from "../color/separations.js";

  import * as random from "canvas-sketch-util/random";
  import { afterUpdate, onMount } from "svelte";
  import dotprint from "../color/dot-print.js";
  // import * as cmykInput from "./color/cmyk-input.js";

  const layerNames = "CMYK".split("");

  const MAX_CELL_WIDTH = 300;
  const MIN_CELL_WIDTH = 70;

  const PLATE_COLORS = [
    ["C", "#25cfcc", "#000"],
    ["M", "#f711f7", "#000"],
    ["Y", "#e6e63c", "#000"],
    ["K", "hsl(0,0%,0%)", "#fff"],
  ];

  let imageWidth = MAX_CELL_WIDTH;
  let imageHeight = Math.round(imageWidth / ColorSeparations.aspect);

  // let imageWidth = ColorSeparations.width;
  // let imageHeight = ColorSeparations.height;
  const imagePadding = 16;
  const sidePadding = 32;

  let currentVisiblePlates = [0, 1, 2, 3];

  const MIN_CONTAINER_HEIGHT =
    Math.round(MIN_CELL_WIDTH / ColorSeparations.aspect) + sidePadding * 2;

  let _currentWidth;
  let styleWidth;
  let styleHeight;

  resize();

  onMount(() => {
    // let resizeObserver = new ResizeObserver((entries) => {
    //   const bounds = entries[0];
    //   const curWidth = bounds.contentRect.width;
    // });

    // cancelAnimationFrame(raf);
    // resizeObserver.observe(container);

    return () => {
      // if (container) resizeObserver.unobserve(container);
      stop();
    };
  });

  function resize() {
    _currentWidth = window.innerWidth;
    const padCount = currentVisiblePlates.length - 1;
    const targetCellWidth =
      (_currentWidth - imagePadding * padCount - sidePadding * 2) /
      currentVisiblePlates.length;
    const cellWidth = Math.max(
      MIN_CELL_WIDTH,
      Math.min(MAX_CELL_WIDTH, targetCellWidth)
    );
    styleWidth = cellWidth;
    styleHeight = cellWidth / ColorSeparations.aspect;
  }

  function getStyleAttribs(imagePadding, styleWidth, styleHeight) {
    return;
  }
</script>

<svelte:window on:resize|passive={resize} />
<section
  class="plates"
  style="padding: {sidePadding}px; min-height: {MIN_CONTAINER_HEIGHT}px;"
>
  {#each currentVisiblePlates as plate, i}
    <div class="cell" style="margin-left: {i == 0 ? 0 : imagePadding}px;">
      <div
        class="image-container"
        style={`width: ${styleWidth}px; height: ${styleHeight}px;`}
      >
        <img src={ColorSeparations.PLATE_URLS[plate]} alt="Plate C" />
      </div>
      <div class="caption">
        <div
          class="caption-bubble"
          style="background: {PLATE_COLORS[plate][1]}; color: {PLATE_COLORS[
            plate
          ][2]};"
        >
          {layerNames[i]}
        </div>
      </div>
    </div>
  {/each}
</section>

<style>
  canvas {
  }
  .caption {
    /* font-size: 12px; */
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
  }
  .caption-bubble {
    /* background: blue; */
    width: 24px;
    height: 24px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    padding: 5px;
    /* padding: 5px 20px; */
  }
  .image-container {
  }
  .image-container img {
    width: 100%;
    height: auto;
  }
  .proof {
    width: auto;
  }
  .plates {
    overflow: hidden;
    box-sizing: border-box;
    /* background: hsl(0, 0%, 97%); */
    /* background: white; */
    /* color: black; */
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }
</style>
