const availableForPreOrder = [
  'dice500',
  'wpc300high',
  'wpc500high',
  'rgfdealer213blue',
  'rgfdealer213black',
  'rgfpremier213black',
  'rgfpremier213blue',
  'rgfpremier213green',
  'rgfpro213green',
  'rgfpro213black',
  'rgftourn213green',
  'pt2400black',
  'pt3600black',
  'miniptblack',
  'rtminigreen',
  't800black',
  't800green',
  'htop500blue',
  'htop500black',
  'htop500green',
  'cs500black',
  'cs500green',
  'cs500blue',
  'rt400black',
  'rt300black',
  'rt200green',
  'ptf301black',
  'ptf301blue',
  'ptf301green',
  'rgfpro213blue',
  'rgftourn213blue',
  'rgftourn213black',
  'pt2400blue',
  'rtminiblue',
  'tourneypro500low',
  'tourneypro1000high',
  'propoker500high'
]

function getDueDate () {
  return 'February 7th'
}

function isPreOrder (sku) {
  return availableForPreOrder.includes(sku.toLowerCase())
}

export { isPreOrder, getDueDate }
