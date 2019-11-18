import 'lazysizes/plugins/object-fit/ls.object-fit';
import 'lazysizes/plugins/parent-fit/ls.parent-fit';
import 'lazysizes/plugins/rias/ls.rias';
import 'lazysizes/plugins/bgset/ls.bgset';
import 'lazysizes';
import 'lazysizes/plugins/respimg/ls.respimg';
import 'intersection-observer';

import '../../styles/theme.scss';
import '../../styles/theme.scss.liquid';

import {focusHash, bindInPageLinks} from '@shopify/theme-a11y';
// import {cookiesEnabled} from '@shopify/theme-cart';

// Sets up the global state.
import '../utils/global_events';

// Header is needed on every page
import {initHeader} from '../sections/header';

// Check for internet explorer. Hack needed unless Slate adds support for IE...
const isIE = window.navigator.userAgent.match(/(MSIE|Trident)/);

if (isIE) {
  const header = document.getElementsByTagName('header')[0];
  const alert = document.createElement('div');
  alert.style.position = 'fixed';
  alert.style.width = '100vw';
  alert.style.height = '100vh';
  alert.style.background = 'white';
  alert.style.margin = '0 auto';
  alert.style.padding = '40px';
  alert.style.color = 'black';
  alert.style.fontSize = '1.6em';
  alert.style.zIndex = '100';
  alert.style.textAlign = 'center';
  alert.innerHTML = `
    <h2>Welcome to <strong>Riverboat Gaming Poker</strong></h2>
    <h2>Please update your browser :-)</h2>
    <p>We are really sorry, but we are not able to support Internet Explorer 11 or lower anymore. Maintaining support for these browsers takes up valuable time, and we would much rather spend it making our products and services better!</p>
    <p>Literally any other browser will do, Microsoft Edge, Google Chrome, Mozilla Firefox, Apple Safari, Opera...</p>
    <p>These newer browsers are more secure, safer, faster and make things look and feel nicer - you won't regret the upgrade!</p>
    <p>Thanks, and sorry for the inconvenience. :-)</p>
  `;
  header.appendChild(alert);
}

initHeader();

// Common a11y fixes
focusHash();
bindInPageLinks();

// Apply a specific class to the html element for browser support of cookies.
// https://github.com/Shopify/starter-theme/issues/112
if (window.navigator.cookieEnabled) {
  document.documentElement.className = document.documentElement.className.replace(
    'supports-no-cookies',
    'supports-cookies',
  );
}
