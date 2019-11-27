import 'whatwg-fetch';

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'same-origin',
};

/*
  Important NOTE re. Shopify product endpoint weirdness.
  For some reason the .json endpoint returns product image objects including alt, height and width.
  The .js endpoint return just an array of url strings.
  The .json endpoint does not return variant availability info - but .js does.
  : This is why there are two different calls to the same endpoint.
  : Both are required to make the product page work..(!)
*/

async function getProductData(productHandle) {
  try {
    const res = await fetch(`/products/${productHandle}.js`, {
      ...config,
      method: 'GET',
    });
    const product = await res.json();
    return product;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getProductJSON(productHandle) {
  try {
    const res = await fetch(`/products/${productHandle}.json`, {
      ...config,
      method: 'GET',
    });
    const {product} = await res.json();
    return product;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getCollectionData(collectionHandle) {
  try {
    const res = await fetch(`/collections/${collectionHandle}.json`, {
      ...config,
      method: 'GET',
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getCollectionProducts(collectionHandle) {
  try {
    const res = await fetch(`/collections/${collectionHandle}/products.json`, {
      ...config,
      method: 'GET',
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getCartData() {
  try {
    const res = await fetch('/cart.js', {
      ...config,
      method: 'GET',
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/*
  {
    quantity: 1,
    id: 794864229, [variantId]
    properties: {
      'First name': 'Caroline'
}
*/
async function addItemsToCart(addData) {
  try {
    const res = await fetch('/cart/add.js', {
      ...config,
      method: 'POST',
      body: JSON.stringify(addData),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// To remove an item pass quantity of zero. Can only update a single line quantity at a time.
// @param {updateData} = { key: lineKey, quantity: newQuantity }
async function updateCartLineQuantity(updateData) {
  try {
    const res = await fetch('/cart/change.js', {
      ...config,
      method: 'POST',
      body: JSON.stringify(updateData),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// https://help.shopify.com/en/themes/development/getting-started/using-ajax-api#update-cart
// Update endpoint for any of the cart data. can also update multiple things / lines at once.
async function updateCart(updateData) {
  try {
    const res = await fetch('/cart/update.js', {
      ...config,
      method: 'POST',
      body: JSON.stringify(updateData),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function submitCartToCheckout() {
  try {
    const res = await fetch('/cart/checkout.js', {
      ...config,
      method: 'POST',
      redirect: 'follow',
    });
    if (res.redirected) {
      window.location.href = res.url;
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getRecommendedProducts(productId, limit = 3) {
  try {
    const res = await fetch(`/recommendations/products.json?product_id=${productId}&limit=${limit}`);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export {
  addItemsToCart, updateCartLineQuantity, updateCart, getCartData,
  getProductData, getProductJSON, getCollectionData,
  getCollectionProducts, submitCartToCheckout, getRecommendedProducts,
};
