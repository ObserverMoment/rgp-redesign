const displayStrings = {
  nextDay: 'Usually next working day when ordered by 2pm',
  twoDays: 'Usually delivered within 2 working days when ordered by 2pm',
  contactUs: 'We do not deliver here as standard. Please contact us for a quote.',
};

const FREE = 'free';

const rates = {
  ukMainland: {
    small: {
      price: FREE,
      time: displayStrings.nextDay,
    },
    medium: {
      price: FREE,
      time: displayStrings.nextDay,
    },
    large: {
      price: FREE,
      time: displayStrings.twoDays,
    },
  },
  ireland: {
    small: {
      price: 10,
      time: displayStrings.twoDays,
    },
    medium: {
      price: 20,
      time: displayStrings.twoDays,
    },
    large: {
      price: 30,
      time: displayStrings.twoDays,
    },
  },
  ukRemote: {
    small: {
      price: 10,
      time: displayStrings.twoDays,
    },
    medium: {
      price: 20,
      time: displayStrings.twoDays,
    },
    large: {
      price: 30,
      time: displayStrings.twoDays,
    },
  },
  scottishIsles: {
    small: {
      price: 20,
      time: displayStrings.twoDays,
    },
    medium: {
      price: 30,
      time: displayStrings.twoDays,
    },
    large: {
      price: 40,
      time: displayStrings.twoDays,
    },
  },
  euro1: {
    small: {
      price: 5,
      time: displayStrings.twoDays,
    },
    medium: {
      price: 10,
      time: displayStrings.twoDays,
    },
    large: {
      price: null,
      time: displayStrings.contactUs,
    },
  },
};

export {rates};
