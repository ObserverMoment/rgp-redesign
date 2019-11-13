const defaultShipZone = 'ukmainland';

const deliveryDisplayTexts = {
  0: 'Usually next working day when ordered by 2pm',
  1: 'Usually delivered 1 - 2 working days',
  2: 'Usually delivered 2 - 3 working days',
  3: 'Usually delivered 2 - 4 working days',
  4: 'Usually delivered 4 - 6 working days',
  5: 'Usually delivered 4 - 7 working days',
  99: 'Sorry, we do not deliver this product here as standard. Please contact us for a quote.',
};

// Price is a tuple where [0] is first item del cost and [1] is all subsequent items del cost.
const rates = {
  eu1: {
    small: {price: [500, 250], time: 2},
    medium: {price: [1000, 500], time: 2},
    large: {price: [0, 0], time: 99},
  },
  eu2: {
    small: {price: [600, 300], time: 3},
    medium: {price: [2200, 1100], time: 3},
    large: {price: [0, 0], time: 99},
  },
  eu3: {
    small: {price: [700, 350], time: 3},
    medium: {price: [2000, 1000], time: 3},
    large: {price: [0, 0], time: 99},
  },
  eu4: {
    small: {price: [800, 400], time: 3},
    medium: {price: [2000, 1000], time: 3},
    large: {price: [0, 0], time: 99},
  },
  eu5: {
    small: {price: [1100, 550], time: 3},
    medium: {price: [2200, 1100], time: 3},
    large: {price: [0, 0], time: 99},
  },
  eu6: {
    small: {price: [1400, 700], time: 4},
    medium: {price: [2000, 1000], time: 4},
    large: {price: [0, 0], time: 99},
  },
  eu7: {
    small: {price: [2000, 1000], time: 5},
    medium: {price: [2200, 1100], time: 4},
    large: {price: [0, 0], time: 99},
  },
  eu8: {
    small: {price: [800, 400], time: 5},
    medium: {price: [2200, 1100], time: 4},
    large: {price: [0, 0], time: 99},
  },
  // jersey, guernsey, man, wight, scilly
  channeisles: {
    small: {price: [900, 450], time: 2},
    medium: {price: [1000, 500], time: 2},
    large: {price: [2000, 1000], time: 3},
  },
  ireland: {
    small: {price: [400, 200], time: 2},
    medium: {price: [1000, 500], time: 2},
    large: {price: [2000, 1000], time: 3},
  },
  ukmainland: {
    small: {price: [0, 0], time: 0},
    medium: {price: [0, 0], time: 1},
    large: {price: [0, 0], time: 1},
  },
  northernireland: {
    small: {price: [900, 450], time: 2},
    medium: {price: [0, 0], time: 2},
    large: {price: [2000, 1000], time: 3},
  },
  scottishhigh: {
    small: {price: [900, 450], time: 2},
    medium: {price: [2000, 1000], time: 3},
    large: {price: [2000, 1000], time: 3},
  },
  zone9: {
    small: {price: [0, 0], time: 99},
    medium: {price: [3000, 1500], time: 3},
    large: {price: [0, 0], time: 99},
  },
};

export {rates, deliveryDisplayTexts, defaultShipZone};
