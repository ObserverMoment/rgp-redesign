const selectors = {
  loginInput: '[data-login-input]',
  inputLabel: '[data-login-input-label]',
};

/**
 *  Show/Hide input labels
 */
(function() {
  console.log('setting up');
  document.querySelectorAll(selectors.loginInput).forEach((input) => {
    console.log('input', input);
    input.addEventListener('input', (event) => {
      console.log(event.target);
      // Get related label.
      const relatedLabel = Array.from(document.querySelectorAll(selectors.inputLabel)).find((label) => label.htmlFor === event.target.id);
      if (event.target.value.length > 0) {
        relatedLabel.classList.add('show-input-label');
      } else {
        relatedLabel.classList.remove('show-input-label');
      }
    });
  });
})();
