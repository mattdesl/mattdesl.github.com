<script>
  export let src;
  export let caption = "";
  export let centerCaption = false;
  export let width = "";
</script>

<div class="image-container">
  <img {src} class="image" style="width: {width ? width : '100%'}" />
  {#if caption}
    <div class="caption" class:centerCaption>
      {caption}
    </div>
  {/if}
</div>

<style>
  .centerCaption {
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .image-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 2em;
    margin-bottom: 2em;
    /* width: 30em; */
  }
  .image-container .caption {
    align-self: flex-start;
    font-size: 11px;
    margin-top: 8px;
    font-style: italic;
  }
  .image {
    width: 100%;
    height: auto;
  }
</style>
