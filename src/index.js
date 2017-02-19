const classes = require('dom-classes');

const isMobile = /(Android|iOS|iPhone|iPod|iPad)/i.test(navigator.userAgent);
if (!isMobile) {
  classes.add(document.documentElement, 'no-touch');
}

require('./work')
