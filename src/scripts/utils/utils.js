import BezierEasing from 'bezier-easing';

/*
  @param {positions: array} - Start and end Y co-ords.
  @param {bezier: array} - as per CSS transition schema.
  @param {duration: number} - in ms.
*/
function smoothScrollY([startY, endY], [p1x, p1y, p2x, p2y], duration) {
  const easing = BezierEasing(p1x, p1y, p2x, p2y);

  const distance = endY - startY;
  let startTime = null;

  function scroll(currentTimestamp) {
    if (!startTime) {
      startTime = currentTimestamp;
    }
    const timeElapsed = currentTimestamp - startTime;
    const progress = timeElapsed / duration;
    // progress must be between 0 and 1
    const eased = easing(progress);
    window.scrollTo(0, startY + (eased * distance));
    if (timeElapsed < duration) {
      requestAnimationFrame(scroll);
    }
  }

  requestAnimationFrame(scroll);
}

function smoothFade(type, element, duration, [p1x = 0.47, p1y = 0, p2x = 0.745, p2y = 0.715], next) {
  if (!['in', 'out'].includes(type)) { console.error('Type must be either \'in\' or \'out\''); }
  const easing = BezierEasing(p1x, p1y, p2x, p2y);

  let startTime = null;
  const startOpacity = type === 'in' ? 0 : 1;
  const endOpacity = type === 'out' ? 0 : 1;
  const totalChange = endOpacity - startOpacity;

  function fade(currentTimestamp) {
    if (startTime === null) {
      startTime = currentTimestamp;
    }

    const timeElapsed = currentTimestamp - startTime;
    const progress = timeElapsed / duration;
    const eased = easing(progress);
    element.style.opacity = (startOpacity + (totalChange * eased));

    if (timeElapsed < duration) {
      requestAnimationFrame(fade);
    } else if (next) { next(); }

  }

  requestAnimationFrame(fade);
}

/*
  @param {originalSrc: string} - 'http...etc'
  @param {requiredDimensions: string} - '{width}x{height}'
*/
function formImageSizeUrl(originalSrc, requiredDimensions) {
  return originalSrc.replace('.jpg', `_${requiredDimensions}.jpg`);
}

export {smoothScrollY, smoothFade, formImageSizeUrl};
