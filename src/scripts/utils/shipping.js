import {rates} from './shipping_rates';

const options = [
  {value: 'ukMainland', text: 'England, Wales, Lowland Scotland'},
  {value: 'ireland', text: 'Republic and Northern Ireland'},
  {value: 'channelIsles', text: 'Channel Islands'},
  {value: 'highlandScotland', text: 'Highland Scotland'},
  {value: 'scottishIsles', text: 'Scottish Islands'},
  {value: 'france', text: 'France'},
  {value: 'germany', text: 'Germany'},
  {value: 'belgium', text: 'Belgium'},
];

const zones = {
  ukMainland: 'ukMainland',
  ireland: 'ireland',
  channelIsles: 'ukRemote',
  highlandScotland: 'ukRemote',
  scottishIsles: 'scottishIsles',
  france: 'euro1',
  germany: 'euro1',
  belgium: 'euro1',
};

const productGroup = {
  dice500: 'small',
  wpc300high: 'small',
  rt200green: 'medium',
  bcfolding: 'large',
};

function calculateRate(sku, country) {
  const zone = zones[country];
  const group = productGroup[sku];
  return rates[zone][group];
}

export {calculateRate, options};
