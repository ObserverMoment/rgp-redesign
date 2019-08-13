function smoothScroll(yPos, duration) {
  console.log(yPos);
  console.log(duration);
}

/*
  @param {originalSrc: string} - 'http...etc'
  @param {requiredDimensions: string} - '{width}x{height}'
*/
function formImageSizeUrl(originalSrc, requiredDimensions) {
  return originalSrc.replace('.jpg', `_${requiredDimensions}.jpg`);
}

export {smoothScroll, formImageSizeUrl};
