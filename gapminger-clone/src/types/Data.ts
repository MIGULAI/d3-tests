export enum Continents {
  EUROP = 'europe',
  ASIA = 'asia',
  AMERICAS = 'americas',
  AFRICA = 'africa',
}

export type DataItem = {
  continent: Continents;
  country: string;
  income: number ;
  life_exp: number ;
  population: number ;
}

export type YearData = {
  countries: DataItem[];
  year: number;
}

export type Data = YearData[];