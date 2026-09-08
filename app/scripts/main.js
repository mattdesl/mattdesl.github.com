const email = document.body.querySelector(".email");
if (email) {
  const txt = email.textContent
    .replace("at", "@")
    .replace("dot", ".")
    .replace(/\s+/g, "");
  email.textContent = txt;
  email.href = `mailto:${txt}`;
}

const globalColors = [
  "#E84420",
  "#F4CD00",
  "#3E58E2",
  "#F1892A",
  "#22A722",
  "#7F3CAC",
  "#F391C7",
  // "#999999", //
  // "#995F29",//
  "#3DC1A2",
  // "#D5B3E5",//
];

const rnd = (arr) => arr[Math.floor(arr.length * Math.random())];

const shuffle = (arr) => {
  var rand;
  var tmp;
  var len = arr.length;
  var ret = arr.slice();
  while (len) {
    rand = Math.floor(Math.random() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
};

const els = [...document.querySelectorAll(".bullet")];
console.log("els", els);
if (els.length > 0) {
  const colors = shuffle(globalColors);
  let i = 0;
  els.forEach((el) => {
    el.style.setProperty("--bullet-color", colors[i++ % colors.length]);
    console.log(el);
  });
}
