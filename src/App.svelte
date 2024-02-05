<script>
  // import ColorPlates from "./ColorPlates.svelte";
  // import * as profiles from "./color/color-profiles.js";
  // import * as ColorSeparations from "./color/separations";
  import Explorer from "./components/Explorer.svelte";
  import Image from "./components/Image.svelte";
  import Plates from "./components/Plates.svelte";
  import photo from "/assets/images/photo.jpg";

  // import closeup01 from "/assets/images/CLOSEUP_DETAIL_INVERT_02.png";
  import interview from "/assets/images/interview.jpg";
  import mockup from "/assets/images/mockup.jpg";
  import snap from "/assets/images/snap.jpg";
  import process from "/assets/images/process.jpg";
  import process2 from "/assets/images/process2.jpg";
  import playSvg from "/assets/icons/play.svg";
</script>

<div class="container">
  <div class="content">
    <nav>
      <h4 class="backnav">
        <a href="https://mattdesl.com/"> ← Matt DesLauriers </a>
      </h4>
    </nav>
    <h1 class="page-intro">Sierra</h1>
    <h1 class="dateline">
      2024.02 – a print + digital collaboration with Avant Arte
    </h1>
    <p>
      <em>Sierra</em> is a single output of a generative algorithm, selected among
      countless potential candidates, and translated into a high quality physical
      screen print in collaboration with Avant Arte.
    </p>
    <p>
      <a
        href="https://avantarte.com/products/matt-deslauriers-sierra"
        target="_blank">view on Avant Arte ↗</a
      >
    </p>
    <Image src={photo} caption="Image courtesy of Avant Arte" />

    <h2>Color Separation</h2>
    <p>
      As part of the silk screen process, a colour separation technique was
      applied to the artwork, deconstructing it into Cyan, Magenta, Yellow, and
      Black (CMYK) colour plates. The printed edition is accompanied by a
      digital release in the form of ERC-1155 NFTs, where each token represents
      a single colour plate.
    </p>

    <div class="fullwidth">
      <Plates />
    </div>

    <p>
      The above plates are bitmap negatives of the CMYK ink layers, rendered
      with thousands of small dots. The black and white design is inspired by
      the way that a light-sensitive emulsion is applied to a physical mesh.
      These four digital CMYK Plates can be reconstructed to form a full colour
      composite, mirroring the final printed artwork. They can also be
      recombined in different combinations and with different inks to produce
      interesting results. Sierra is a project that spans across digital and
      analog media, acting as a study in the dynamics of colour science and the
      printmaking process.
    </p>

    <div class="fullwidth">
      <Explorer />
    </div>

    <h2>Print Details</h2>
    <p>
      The silk screen print will be available starting Feb 7, 2024 (6pm GMT) and
      ending Feb 9, 2024 (6pm GMT). This is a timed 48h open edition, which
      means that no more purchases will be possible after the sale period
      closes. The artwork can be purchased framed or unframed. Visit the <a
        href="https://avantarte.com/products/matt-deslauriers-sierra"
        target="_blank">Avant Arte page</a
      > for further details.
    </p>
    <div class="feature-list">
      <div>
        <label>dimensions</label> — 48.5cm width x 67.5cm height (unframed)
      </div>
      <div>
        <label>medium</label> — 15 colour silkscreen print including 2 fluorescent
        colours
      </div>
      <div>
        <label>substrate</label> — 410gsm somerset radiant white paper
      </div>
      <div>
        <label>finishing</label> — individually signed and dated by the artist
      </div>
    </div>

    <Image
      width="550px"
      src={snap}
      centerCaption
      caption="photo courtesy of Avant Arte"
    />

    <!-- <h2>Digital Editions</h2>
    <p></p>
    <p>
      Below you can see some close-ups of the digital plates, rendered in
      JavaScript and re-exported at a higher resolutions.
    </p>

    <div class="fullwidth">
      <Image
        src={closeup01}
        centerCaption
        caption="Above: Closeup of Plate K"
      />
    </div> -->

    <h2>Interview</h2>
    <p>
      In preparation for the release, Avant Arte recorded a conversation between
      the artist and master screenprinter Tom Murphy of Make-Ready. The full
      conversation is 37 minutes long, almost like a podcast format, and can be
      viewed in the link below. The discussion dives into the generative art
      process, colour science, screen printing, and more.
    </p>

    <div class="interview">
      <Image src={interview} centerCaption caption="" />
      <div class="overlay-black"></div>
      <a
        class="play-icon-container"
        href="https://avantarte.com/insights/articles/Matt-DesLauriers-Generative-printmaking-and-systems-of-colour"
        target="_blank"
      >
        <img class="play-icon" src={playSvg} alt="" />
      </a>
    </div>

    <h2>Further Notes</h2>
    <p>
      The final edition size is determined by the number of purchases during the
      timed open edition. However, there are an additional 20 Artist Proof
      prints (which will also have NFTs accompanying them), and these have been
      allocated to the artist and Avant Arte to use at their discretion.
    </p>
    <p>
      Note that collectors will have a limited period after purchasing during
      which they will be able to claim the four NFTs. The claim will incur gas
      costs (Ethereum), and will perform a 4x ERC-1155 NFT mint operation within
      a single transaction.
    </p>
    <p>
      At a future point, if there is demand, the black & white digital Color
      Plates may also be realized in a separate project and print series.
    </p>
    <!-- 
    <h2>Process</h2>
    <p>
      Some behind-the-scenes photos of the silk screen print process, courtesy
      of Avant Arte and Make-Ready.
    </p> -->

    <Image
      src={process}
      centerCaption
      caption="Matt and the screenprinter Tom Murphy looking at CMYK inks, photo courtesy of Avant Arte"
    />
    <Image
      src={process2}
      centerCaption
      caption="color separations printed on acetate, used to expose the light-sensitive emulsion on the screen mesh, photo courtesy of Avant Arte"
    />

    <Image
      src={mockup}
      width="450px"
      centerCaption
      caption="mockup with a custom black frame"
    />

    <p>
      <a
        href="https://avantarte.com/products/matt-deslauriers-sierra"
        target="_blank">view more photos on Avant Arte ↗</a
      >
    </p>
  </div>
</div>

<style>
  :global(body) {
    color: hsl(0, 0%, 10%);
    /* color: #333; */
    -webkit-text-size-adjust: none;
    background: hsl(0, 0%, 95%);
    /* background: hsl(0, 0%, 100%); */
    /* background: #e9e3d5; */
    /* background: rgb(242, 242, 242); */
    font-family: "BerkleyMono", "Andale Mono", "Courier New", monospace;
    /* ugh */
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
    margin: 0 auto;
    padding: 0em;
    width: 100%;
    overflow-x: none;
  }
  :global(html) {
    width: 100%;
  }
  h2 {
    margin-top: 4rem;
  }
  nav {
    /* padding: 2em; */
    /* padding-bottom: 0; */
  }
  .container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    padding: 2em;
  }
  .content {
    /* padding: 2em; */
    width: 100%;
    max-width: 50em;
  }
  .fullwidth {
    width: calc(100vw - 0px);
    margin-top: 2rem;
    margin-bottom: 2rem;
    margin-left: calc(-50vw + 50% + 0px);
  }
  .feature-list {
    font-size: 12px;
    padding: 1rem;
  }

  .feature-list div {
    margin-top: 0.5rem;
  }
  .feature-list label {
    /* text-align: right; */
    /* margin-right: 1rem; */
    /* min-width: 100px; */
    display: inline-block;
    font-weight: bold;
  }

  .interview {
    position: relative;
  }
  .overlay-black {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    user-select: none;
    touch-action: none;
    background: rgba(0, 0, 0, 0.5);
  }
  .play-icon {
  }
  .play-icon-container {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  /* :global(body) {
    font-family: monospace;
    font-size: 14px;
    color: black;
    padding: 0;
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem;
    box-sizing: border-box;
  }

  .info {
  }

  :root {
  }

  h1 {
    padding: 0;
    margin: 0;
  }
  p {
    line-height: 1.5;
  }
  main {
    max-width: 720px;
  } */
</style>
