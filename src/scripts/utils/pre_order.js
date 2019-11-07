const availableForPreOrder = [
  'rgfdealer213black',
  'rgfdealer213blue',
  'rgfdealer213green',
  'rgfpremier213black',
  'rgfpremier213blue',
  'rgfpremier213green',
  'rgfpro213black',
  'rgfpro213blue',
  'rgfpro213green',
  'rgftourn213black',
  'rgftourn213blue',
  'rgftourn213green',
  'pt2400black',
  'pt2400blue',
  'pt2400green',
  'pt3600black',
  'pt3600green',
  'pt3600blue',
  'miniptblue',
  'miniptgreen',
  'miniptblack',
  't800black',
  'htop500green',
  'htop500black',
  'rtminigreen',
  'rtminiblack',
  'rtminiblue',
  'cs500darkblue',
  'cs500green',
  'cs500black',
  'rt100red',
  'rt200green',
  'rt300blue',
  'rt400black',
  'ptf301green',
  'ptf301blue',
  'ptf301black',
  'pmat100black',
  'pmat140black',
  'pmat180black',
  'pmat100green',
  'pmat140green',
  'pmat180green',
  'pmat100blue',
  'pmat140blue',
  'pmat180blue',
];

function getDueDate() {
  return 'November 22nd';
}

function isPreOrder(sku) {
  return availableForPreOrder.includes(sku.toLowerCase());
}

export {isPreOrder, getDueDate};
