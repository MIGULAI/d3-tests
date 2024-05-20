import { Data } from "./types/coins";
import { parseTime } from "./utils";

/**
 * Fetches data from the data.json file
 * @return {Promise<Data>} - Data from the fetch request
 */
const fetchD3Data = async (): Promise<Data>  => {
  const response = await fetch('data/coins.json');
  const data = await response.json();
  Object.keys(data).forEach((coin: string) => {
    data[coin] = data[coin].filter((item: any) => {
      return item.price_usd !== null;
  })});
  Object.keys(data).forEach((coin: string) => {
    data[coin].forEach((item: any) => {
      
      item.date = parseTime(item.date as string);
      
      const market_cap = Number(item.market_cap);
      item.market_cap = isNaN(market_cap) ? 0 : market_cap;
      const price = Number(item.price);
      item.price = isNaN(price) ? 0 : price;
      const vol = Number(item['24h_vol']);
      item['24h_vol'] = isNaN(vol) ? 0 : vol;
    });
  });
  return data as Data;
};

export default fetchD3Data;