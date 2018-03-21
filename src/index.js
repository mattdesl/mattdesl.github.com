const classes = require('dom-classes');

const isMobile = /(Android|iOS|iPhone|iPod|iPad)/i.test(navigator.userAgent);
if (!isMobile) {
  classes.add(document.documentElement, 'no-touch');
}

require('./work');

const email = document.querySelector('#email');
email.style.display = '';
email.querySelector('a').href = 'mailto:info@mattdesl.studio';
