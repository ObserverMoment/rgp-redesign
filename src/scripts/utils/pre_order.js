const availableForPreOrder = [];

function getDueDate() {
  return 'November 21st';
}

function isPreOrder(sku) {
  return availableForPreOrder.includes(sku.toLowerCase());
}

export {isPreOrder, getDueDate};
