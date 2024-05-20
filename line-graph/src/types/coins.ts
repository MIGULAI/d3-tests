
export type DataItem = {
  '24h_vol': number,
  date: Date,
  market_cap: number,
  price: number,
}

export type Data = {
  [key: string]: DataItem[]
};

export type SelectedTime = {
  start: Date,
  end: Date
}