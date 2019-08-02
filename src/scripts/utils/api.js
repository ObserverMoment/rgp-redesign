async function getCollectionData(collectionHandle) {
  const res = await fetch('/collections/poker-tables/products/riverboat-tl-poker-table-in-green-speed-cloth-and-folding-legs-213cm.json', {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    method: 'GET',
    credentials: 'same-origin',
  });
  const json = await res.json();
  return json;
}

async function getCartData() {
  const res = await fetch('/cart.js', {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    method: 'GET',
    credentials: 'same-origin',
  });
  const json = await res.json();
  return json;
}

async function addItemsToCart(addData) {
  const res = await fetch('/cart/add.js', {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    method: 'POST',
    body: JSON.stringify(addData),
    credentials: 'same-origin',
  });
  const json = await res.json();
  return json;
}

export {addItemsToCart, getCartData, getCollectionData};
