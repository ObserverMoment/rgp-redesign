const deliveryDisplayTexts = {
  1: 'Usually next working day when ordered by 2pm',
  2: 'Usually delivered 2 - 3 working days',
  3: 'Usually delivered 3 - 5 working days',
  4: 'Usually delivered 4 - 6 working days',
  99: 'Sorry, we do not deliver some larger items here as standard. Please contact us for a quote.',
};

const rates = {
  ukMainland: {
    small: {
      price: 0,
      time: 1,
    },
    medium: {
      price: 0,
      time: 1,
    },
    large: {
      price: 0,
      time: 2,
    },
  },
  ireland: {
    small: {
      price: 1000,
      time: 2,
    },
    medium: {
      price: 2000,
      time: 2,
    },
    large: {
      price: 3000,
      time: 2,
    },
  },
  ukRemote: {
    small: {
      price: 2000,
      time: 2,
    },
    medium: {
      price: 3000,
      time: 2,
    },
    large: {
      price: 4000,
      time: 2,
    },
  },
  scottishIsles: {
    small: {
      price: 3000,
      time: 2,
    },
    medium: {
      price: 4000,
      time: 2,
    },
    large: {
      price: 5000,
      time: 2,
    },
  },
  euro1: {
    small: {
      price: 500,
      time: 2,
    },
    medium: {
      price: 1000,
      time: 2,
    },
    large: {
      price: null,
      time: 99,
    },
  },
};

export {rates, deliveryDisplayTexts};
