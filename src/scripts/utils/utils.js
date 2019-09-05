import BezierEasing from 'bezier-easing';

/*
  @param {positions: array} - Start and end Y co-ords.
  @param {bezier: array} - as per CSS transition schema.
  @param {duration: number} - in ms.
  @return - the id of the animationFrame instance.
*/
function smoothScrollY([startY, endY], [p1x = 0.47, p1y = 0, p2x = 0.745, p2y = 0.715], duration) {
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

  return requestAnimationFrame(scroll);
}

/*
  * Returns bezier curve eased translate values for use in animations.
  * @param {animator: function} - Receives the X and Y positions and uses them to animate.
  * @param {positions: object} - {xPos: [start, end], yPos: [start, end]}.
  * @param {bezier: array} - as per CSS transition schema.
  * @param {duration: number} - in ms.
  * @return - the id of the animationFrame instance.
*/
function smoothTranslate(animator, {xPos = [0, 0], yPos = [0, 0]}, [p1x = 0.47, p1y = 0, p2x = 0.745, p2y = 0.715], duration) {
  const easing = BezierEasing(p1x, p1y, p2x, p2y);
  const xStart = xPos[0];
  const xEnd = xPos[1];
  const xDistance = xPos[1] - xPos[0];
  const yStart = yPos[0];
  const yEnd = yPos[1];
  const yDistance = yPos[1] - yPos[0];

  let startTime = null;
  let curXPos = xStart;
  let xComplete = false;
  let curYPos = yStart;
  let yComplete = false;

  function checkXComplete() {
    if (xDistance < 0) {
      return curXPos <= xEnd;
    } else {
      return curXPos >= xEnd;
    }
  }

  function checkYComplete() {
    if (yDistance < 0) {
      return curYPos <= yEnd;
    } else {
      return curYPos >= yEnd;
    }
  }

  function translate(currentTimestamp) {
    if (!startTime) {
      startTime = currentTimestamp;
    }
    const timeElapsed = currentTimestamp - startTime;
    const progress = timeElapsed / duration;
    const eased = easing(progress);

    curXPos = xStart + (eased * xDistance);
    curYPos = yStart + (eased * yDistance);

    xComplete = checkXComplete();
    yComplete = checkYComplete();

    animator(
      xComplete ? xEnd : curXPos,
      yComplete ? yEnd : curYPos,
    );

    if (!xComplete || !yComplete) {
      requestAnimationFrame(translate);
    }
  }

  return requestAnimationFrame(translate);
}

function smoothFade([startOpacity = 1, endOpacity = 1], element, duration, [p1x = 0.47, p1y = 0, p2x = 0.745, p2y = 0.715], next) {
  const easing = BezierEasing(p1x, p1y, p2x, p2y);

  let startTime = null;
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

  return requestAnimationFrame(fade);
}

/*
  @param {originalSrc: string} - 'http...etc'
  @param {requiredDimensions: string} - '{width}x{height}'
  * Requests a progressive JPG from shopify CDN in the specified dimensions.
*/
function formImageSizeUrl(originalSrc, requiredDimensions) {
  return originalSrc.replace('.jpg', `_${requiredDimensions}.progressive.jpg`);
}

// Returns iterable array of numbers - like python's 'range function'
function range(start = 0, end = null, step = 1) {
  const _arr = [];
  const _start = end === null ? 0 : start;
  const _end = end === null ? start : end;
  const _step = step;
  let _cur = _start;

  if (_start <= _end) {
    while (_cur < _end) {
      _arr.push(_cur);
      _cur += _step;
    }
  } else {
    while (_cur > _end) {
      _arr.push(_cur);
      _cur += _step;
    }
  }
  return _arr;
}

export {smoothScrollY, smoothFade, formImageSizeUrl, smoothTranslate, range};
