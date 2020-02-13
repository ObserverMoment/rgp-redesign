const availableForPreOrder = []

function getDueDate () {
  return 'February 12th'
}

function isPreOrder (sku) {
  return availableForPreOrder.includes(sku.toLowerCase())
}

export { isPreOrder, getDueDate }
