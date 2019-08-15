import 'whatwg-fetch';

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'same-origin',
};

async function getProductData(productHandle) {
  const res = await fetch(`/products/${productHandle}.json`, {
    ...config,
    method: 'GET',
  });
  const json = await res.json();
  return json;
}

async function getCollectionData(collectionHandle) {
  const res = await fetch(`/collections/${collectionHandle}/products.json`, {
    ...config,
    method: 'GET',
  });
  const json = await res.json();
  return json;
}

async function getCartData() {
  const res = await fetch('/cart.js', {
    ...config,
    method: 'GET',
  });
  const json = await res.json();
  return json;
}

async function addItemsToCart(addData) {
  const res = await fetch('/cart/add.js', {
    ...config,
    method: 'POST',
    body: JSON.stringify(addData),
  });
  const json = await res.json();
  return json;
}

// To remove an item pass quantity of zero. Can only update a single line quantity at a time.
// @param {updateData} = { key: lineKey, quantity: newQuantity }
async function updateCartLineQuantity(updateData) {
  const res = await fetch('/cart/change.js', {
    ...config,
    method: 'POST',
    body: JSON.stringify(updateData),
  });
  const json = await res.json();
  return json;
}

// https://help.shopify.com/en/themes/development/getting-started/using-ajax-api#update-cart
// Update endpoint for any of the cart data. can also update multiple things / lines at once.
async function updateCart(updateData) {
  const res = await fetch('/cart/update.js', {
    ...config,
    method: 'POST',
    body: JSON.stringify(updateData),
  });
  const json = await res.json();
  return json;
}

async function submitCartToCheckout() {
  const res = await fetch('/cart/checkout.js', {
    ...config,
    method: 'POST',
    redirect: 'follow',
  });
  if (res.redirected) {
    window.location.href = res.url;
  }
}

export {addItemsToCart, updateCartLineQuantity, updateCart, getCartData, getProductData, getCollectionData, submitCartToCheckout};
