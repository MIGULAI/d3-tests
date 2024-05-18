import './style.css';
import * as d3 from 'd3';
import { Continents, Data, DataItem, YearData } from './types/Data';
import fetchD3Data from './fetchD3Data';
import d3Tip from 'd3-tip';

let interval: any;

const margin = { top: 10, right: 10, bottom: 150, left: 100 };

const height = 400 - margin.top - margin.bottom;
const width = 600 - margin.left - margin.right;

const canvas = d3.select('#chart-area')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

const continentColor = d3.scaleOrdinal(d3.schemeSet1)

const gLobalGroup = canvas.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
// @ts-ignore
const tip = d3Tip()
  .attr('class', 'd3-tip')
  .html((d: MouseEvent) => {
    // @ts-ignore
    const data = d.target.__data__ as DataItem;

    let text = `<strong>Country:</strong> <span style='color:red'>${data.country}</span><br>`;
    text += `<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${data.continent}</span><br>`;
    text += `<strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(".2f")(data.life_exp)}</span><br>`;
    text += `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(data.income)}</span><br>`;
    text += `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(data.population)}</span><br>`;
    return text;

  })

gLobalGroup.call(tip);

const continents = Object.values(Continents);

const legend = gLobalGroup.append('g')
  .attr('transform', `translate(${width - 10}, ${height - 125})`);

continents.forEach((continent, i) => {
  const legendRow = legend.append('g')
    .attr('transform', `translate(0, ${i * 20})`);

  legendRow.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', continentColor(continent));

  legendRow.append('text')
    .attr('x', -10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('text-transform', 'capitalize')
    .text(continent);
});

// X label
gLobalGroup.append("text")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP Per Capita ($)")

gLobalGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Life Expectancy (Years)")
//time label
const timeLabel = gLobalGroup.append("text")
  .attr("y", height - 10)
  .attr("x", width - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800")

const xAxisGroup = gLobalGroup.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate( 0, ' + height + ')');

const yAxisGroup = gLobalGroup.append('g')
  .attr('class', 'y axis');

const data: Data = await fetchD3Data();
const minYear = d3.min(data, (d) => d.year)!;
const maxYear = d3.max(data, (d) => d.year)!;
let currentYear: number = minYear;

// @ts-ignore
$('#date-slider').slider({
  max: maxYear,
  min: minYear,
  step: 1,
  // @ts-ignore
  slide: function (event: any, ui: { value: number }) {
    currentYear = ui.value;
    const yearData: YearData = data.find((d) => d.year === currentYear)!;
    update(yearData);
  }

});

const x = d3.scaleLog()
  .base(10)
  .range([0, width])
  .domain([142, 150000])
// .paddingInner(0.3)
// .paddingOuter(0.2);

const y = d3.scaleLinear()
  // .base(10)
  .domain([0, 90])
  .range([height, 0]);



const xAxisCall = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format('$'));

const yAxisCall = d3.axisLeft(y)
  .ticks(10)
  .tickFormat((d) => d.toString());
const area = d3.scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000])

xAxisGroup
  .call(xAxisCall)
  .selectAll('text')
  .attr("y", "10")
  .attr("x", "-5")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-40)");


yAxisGroup
  .attr("class", "y axis")
  .call(yAxisCall);

const step = () => {
  if (currentYear === maxYear) {
    currentYear = currentYear;
  } else {
    currentYear++;
  }
  const yearData: YearData = data.find((d) => d.year === currentYear)!;
  update(yearData)
}

document.getElementById('play-button')!.addEventListener('click', () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
    document.getElementById('play-button')!.innerText = 'Play';
  } else {
    interval = setInterval(step, 150);
    document.getElementById('play-button')!.innerText = 'Pause';
  }
});

document.getElementById('reset-button')!.addEventListener('click', () => {
  currentYear = minYear;
  clearInterval(interval);
  interval = null;
  const yearData: YearData = data.find((d) => d.year === currentYear)!;
  update(yearData)
  document.getElementById('play-button')!.innerText = 'Play';

});


const yearData: YearData = data.find((d) => d.year === minYear)!;

update(yearData);

document.getElementById('continent-select')!.addEventListener('change', () => {
  const yearData: YearData = data.find((d) => d.year === currentYear)!;
  update(yearData);
});

function update(data: YearData) {
  const currentYear: number = data.year;
  const countries: DataItem[] = data.countries;

  const continent = document.getElementById('continent-select') as HTMLSelectElement;
  const filteredCountries = countries.filter((d) => continent.value === 'all' || d.continent === continent.value);
  const transition = d3.transition().duration(100);

  /**
   * D3 Update Pattern
   */

  // JOIN new data with old elements.
  const circles = gLobalGroup.selectAll('circle')
    .data(filteredCountries, (d: any) => d.country);

  // EXIT old elements not present in new data.
  circles.exit().remove();

  // ENTER new elements present in new data...
  circles.enter().append("circle")
    .attr("fill", (d) => continentColor(d.continent))
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .merge(circles as any)
    .transition(transition)
    .attr("r", (d) => Math.sqrt(area(d.population) / Math.PI))
    .attr("cx", (d) => x(d.income))
    .attr("cy", (d) => y(d.life_exp));

  timeLabel.text(currentYear.toString());
  $('#year')[0].innerText = currentYear.toString();
  // @ts-ignore
  $('#date-slider').slider('value', currentYear);
}