<script>
  import imageA from './images/a.jpg';
  import imageZoom from './images/zoom.jpg';
  import imageB from './images/b.jpg';
  import imageBook from './images/BookOpen1.jpg';
</script>

<main>
  <h1>Meridian</h1>
  <caption>09.28.2021 / generative software / dimensions variable</caption>
  <article class='first'>
    <p>Meridian is a long-form generative art project and algorithm created by <a href="https://mattdesl.com/" target="_blank">Matt DesLauriers</a>.</p>
    
    <p>The software is a 15 kilobyte, self-contained JavaScript program that constructs stratified landforms using hundreds of thousands of small strokes of colour. The hash of each token describes a coordinate within a multidimensional generative space, locating a unique composition that lies along one of many possible longitudes.
      </p>

    <a href={imageA} target="_blank">
      <img src={imageA} alt="Meridian outputs" />
    </a>

    <p>The project was distributed through <a href="">Art Blocks Playground</a> as a set of 1,000 unique non-fungible tokens (NFTs) on the Ethereum blockchain. The blockchain also acts as permanent, immutable and archival storage of the script.</p>

    <a href={imageZoom} target="_blank">
      <img class='banner' src={imageZoom} alt="Close-up of Meridian output" />
    </a>

  </article>

  <h2>Viewing the Artwork</h2>
  <article>
    <p>The work is best appreciated in large format, such as a 100 cm tall inkjet print, or high density display. All 1,000 tokenized editions can be browsed, including filtering individual algorithmic traits and features, on the <a href="https://artblocks.io/project/163" target="_blank">Art Blocks project page</a>.
    </p>

    <p>The artwork is also embedded below, running in real-time. Click the canvas to generate a new and random Meridian. Each new output is unique—you will never see the same image twice—and the iterations are <em>out-of-band</em> in that they are not part of the tokenized set.</p>

    <iframe loading="lazy" src="/meridian.html" border="0" width="100%" height="auto" scrolling="no"></iframe>

    <p>You can also run the project in full-screen <a href="/meridian.html" target="_blank">here</a>.
    </p>
  </article>

  <h2>Tokenization & Ownership</h2>
  <article>
    <p>
    The work was sold and distributed to collectors as <em><a href="https://nathanielstern.com/text/2021/custodianship-copyright-and-provenance-on-the-non-monetary-value-of-nfts/" target="_blank">non-fungible tokens</a></em>. This gives each edition the unique ability to be assigned to a single Ethereum wallet address, enabling a new paradigm of digital ownership over the artwork.</p>
    
    <p>
    The limited set of tokens have a provenance that tracks the history of ownership and sales, and can be traced back to my artist wallet that initiated the distribution and <a href="https://etherscan.io/tx/0x4dab78569a62a78ed20dab0d19a5986d713e7eea87c62d8b9fa1dc06270ffb33" target="_blank">minted the first edition</a>. This technology acts as a digital analogue to a limited run of signed archival prints.
    </p>

    <p>
      Now that all 1,000 tokens have been distributed, they can only be acquired by purchasing or trading on secondary marketplaces such as <a href="https://opensea.io/collection/meridian-by-matt-deslauriers?search[sortAscending]=false&search[sortBy]=LAST_SALE_PRICE" target="_blank">OpenSea</a>.
    </p>

    <!-- <img src="" /> -->
  </article>


  <h2>Prints & Art Book</h2>
  <article>
    <p>
    Large format prints of Meridian will be available for order toward the end of October 2021. A collector-curated art book will also be designed and published to capture the full range of the algorithm and its technical breakdowns in more detail. For details, see <a href="https://mattdesl.substack.com/p/notes-on-meridian">Notes on "Meridian" (Sept, 2021)</a>.
    </p>

    <a href={imageBook} target="_blank">
      <img src={imageBook} alt="Art Book mockup" />
    </a>

    <caption>art book mockup — release TBD, late 2022</caption>
  </article>

  <h2>Community</h2>
  <article>
    <p>
    For more discussion around Meridian among collectors and the artist, you can join the <a href="https://discord.gg/8n5nnpCH">Art Blocks Discord</a> and find the <em>#matt-deslauriers</em> channel.
    </p>

    <a href={imageB} target="_blank">
      <img src={imageB} alt="Meridian outputs" />
    </a>
    </article>

</main>

<style>
  :global(body) {
    font-family: 'Source Code Pro', 'Helvetica', sans-serif;
    margin: 40px;
    padding: 0;
    margin: 0;
    font-size-adjust: none;
  }
  html {
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    color: rgb(26, 26, 26);
    min-height: 100%;
    /* width: 100%; */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  iframe {
    border: 0;
    /* width: 100%; */

    /* width: calc(100% + 40px); */
    /* margin-left: -20px; */
    height: min(70vh, 750px);
    margin-top: 20px;
    /* margin-bottom: 40px; */
  }


  main {
    max-width: 720px;
    margin: auto;
    margin-top: 0;
    margin-bottom: 0;
    padding: 40px;
    /* margin-top: 20px; */
  }

  caption {
    font-size: 12px;
    text-align: left;
    display: flex;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    margin-bottom: 20px;
    font-style: italic;
  }

  h1, h2 {
    font-weight: 300;
    margin: 0;
    padding: 0;
    margin-bottom: 10px;
    margin-top: 40px;
  }
  h2 {
    margin-bottom: 20px;
  }

  p {
    font-family: 'Source Serif Pro', serif;
    margin: 0;
    padding: 0;
    line-height: 1.75;
    font-size: 18px;
    margin-top: 20px;
    word-break: break-word;
    overflow-wrap: break-word;
    font-kerning: auto;
    -webkit-font-smoothing: antialiased;
  }
  p:first-child {
    margin-top: 0;
  }
  h1:first-child {
    margin-top: 0;;
  }

  p.quote {
    font-family: 'Source Code Pro', 'Helvetica', sans-serif;
    /* padding-left: 40px;
    padding-right: 40px; */
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    font-size: 14px;
    /* line-height: 1.5; */
    position: relative;
  }
  p.quote:before {
    /* content: ' '; */
    width: 5px;
    height: 100%;
    background-color: #e7e7e7;
    position: absolute;
    left: -15px;
    top: 0;
  }

  img {
    /* width: calc(100% + 40px); */
    /* margin-left: -20px; */
    width: 100%;
    height: auto;
    margin-top: 20px;
    /* margin-bottom: 20px; */
  }

  .banner {
    width: calc(100% + 80px); 
    margin-left: -40px;
  }

  a, a:active, a:visited, a:hover {
    color: black;
    font-weight: 400;
    text-decoration: underline;
    position: relative;
  }

  article.first {
  }
</style>