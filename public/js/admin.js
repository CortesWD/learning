const deleteProduct = (btn) => {
  const { value: productId } = btn.parentNode.querySelector('[name=productId]');
  const { value: csrf } = btn.parentNode.querySelector('[name="_csrf"]');
  const productElement = btn.closest('article');

  fetch(`/admin/product/${productId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    }
  })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      productElement.parentNode.removeChild(productElement);
    })
    .catch(err => console.log(err))
};

