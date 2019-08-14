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

/*
  @param {originalSrc: string} - 'http...etc'
  @param {requiredDimensions: string} - '{width}x{height}'
*/
function formImageSizeUrl(originalSrc, requiredDimensions) {
  return originalSrc.replace('.jpg', `_${requiredDimensions}.jpg`);
}

export {smoothScrollY, formImageSizeUrl};
