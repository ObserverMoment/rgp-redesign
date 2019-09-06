const selectors = {
  loginInput: '[data-form-text-input]',
  inputLabel: '[data-form-text-input-label]',
};

/**
 *  Show/Hide input labels
 */
(function() {
  document.querySelectorAll(selectors.loginInput).forEach((input) => {
    input.addEventListener('input', (event) => {
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
