import { Data, YearData } from "./types/Data";

/**
 * Fetches data from the data.json file
 * @return {Promise<Data>} - Data from the fetch request
 */
const fetchD3Data = async (): Promise<Data>  => {
  const response = await fetch('data/data.json');
  const data = await response.json();
  const resultingData: Data =  data.map((year: any) => {
    const res: YearData = {
      countries: [],
      year: 0
    };
     res.countries = year.countries.filter((year: any) => {
      return year.income !== null && year.life_exp !== null && year.population !== null;
    });
    res.countries.forEach((country: any) => {
      country.income = Number(country.income);
      country.life_exp = Number(country.life_exp);
      country.population = Number(country.population);
    });
    res.year = Number(year.year);
    return res as YearData;
  })
  return resultingData;
};

export default fetchD3Data;