import 'whatwg-fetch';

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'same-origin',
};

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
  console.log('cart data', json);
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

async function submitCartToCheckout() {
  const res = await fetch('/cart/checkout.js', {
    ...config,
    method: 'POST',
    redirect: 'follow',
  });
  console.log('cart post res', res);
  if (res.redirected) {
    window.location.href = res.url;
  }
  // const json = await res.json();
  // console.log('cart post json', json);
  // return json;
}

export {addItemsToCart, getCartData, getCollectionData, submitCartToCheckout};
