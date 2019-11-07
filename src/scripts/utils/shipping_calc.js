import {rates} from './shipping_rates';
import {groups} from './shipping_groups';

const options = [
  {value: 'ukmainland', text: 'England, Wales, Lowland Scotland'},
  {value: 'scottishhigh', text: 'Scottish Highlands and Islands'},
  {value: 'northernireland', text: 'Northern Ireland'},
  {value: 'channeisles', text: 'Jersey, Guernsey, Man, Wight, Scilly'},
  {value: 'ireland', text: 'Republic of Ireland'},
  {value: 'eu1', text: 'Belgium, France, Germany, Netherlands, Luxembourg'},
  {value: 'eu2', text: 'Czech Republic, Poland'},
  {value: 'eu3', text: 'Austria, Denmark, Hungary'},
  {value: 'eu4', text: 'Spain, Sweden'},
  {value: 'eu5', text: 'Italy, Estonia, Latvia'},
  {value: 'eu6', text: 'Finland, Portugal'},
  {value: 'eu7', text: 'Bulgaria, Croatia, Romania'},
  {value: 'eu8', text: 'Lithuania, Slovakia, Slovenia'},
  {value: 'zone9', text: 'Norway, Switzerland'},
];

function calculateRate(sku, zone) {
  if (!sku) {
    console.error('You must provide a sku to be able to calculate shipping');
  }
  if (!zone) {
    console.error('You must provide a zone to be able to calculate shipping');
  }

  const group = groups[sku.toLowerCase()];
  if (!group) {
    console.error(`Could not find shipping info for ${sku}, ${zone}`);
  }
  return rates[zone][group];
}

export {calculateRate, options};
