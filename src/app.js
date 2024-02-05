import App from "./App.svelte";
import "./css/base.css";
import "./css/pages.css";

import * as ColorSeparations from "./color/separations";

ColorSeparations.load();

// import * as cmyk from "./cmyk-input.js";

// Load LCMS color profiles module
// profiles.load();

// Load CMYK plate inputs
// cmyk.load();

new App({
  target: document.body,
});
