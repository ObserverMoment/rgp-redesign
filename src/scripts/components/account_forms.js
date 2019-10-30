const selectors = {
  textInput: '[data-form-text-input]',
  textInputLabel: '[data-form-text-input-label]',
};

const classes = {
  show: 'show-input-label',
};

/**
 *  Show/Hide input labels when using standard-form mixin. Attach the data attributes above to labels and text inputs.
 */
function initEventListeners() {
  window.addEventListener('load', () => {
    document.querySelectorAll(selectors.textInput).forEach((input) => {
      const labels = Array.from(document.querySelectorAll(selectors.textInputLabel));
      if (input.value.length > 0) {
        const relatedLabel = labels.find((label) => label.htmlFor === input.id);
        relatedLabel.classList.add(classes.show);
      }
    });
  });
  document.querySelectorAll(selectors.textInput).forEach((input) => {
    const relatedLabel = Array.from(document.querySelectorAll(selectors.textInputLabel)).find((label) => label.htmlFor === input.id);
    input.addEventListener('input', (event) => {
      if (event.target.value.length > 0) {
        relatedLabel.classList.add(classes.show);
      } else {
        relatedLabel.classList.remove(classes.show);
      }
    });
  });

}

initEventListeners();
