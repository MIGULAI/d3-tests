import './style.css';
import * as d3 from 'd3';
import fetchD3Data from './fetchD3Data';
import d3Tip from 'd3-tip';
import { Data, DataItem } from './types/coins';
import { formatTime } from './utils';

const bisectDate = d3.bisector((d: DataItem) => d.date).left
const margin = { top: 10, right: 10, bottom: 150, left: 100 };

const height = 400 - margin.top - margin.bottom;
const width = 600 - margin.left - margin.right;

const x = d3.scaleTime()
  .range([0, width])

const y = d3.scaleLinear()
  .range([height, 0]);

const data: Data = await fetchD3Data();

const canvas = d3.select('#chart-area')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);


const gLobalGroup = canvas.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
// @ts-ignore
const tip = d3Tip()
  .attr('class', 'd3-tip')
  .html((d: MouseEvent) => {
    // @ts-ignore
    const data = d.target.__data__ as DataItem;
    console.log(data);

    let text = 'test';
    // let text = `<strong>Country:</strong> <span style='color:red'>${data.country}</span><br>`;
    // text += `<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${data.continent}</span><br>`;
    // text += `<strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(".2f")(data.life_exp)}</span><br>`;
    // text += `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(data.income)}</span><br>`;
    // text += `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(data.population)}</span><br>`;
    return text;

  })

gLobalGroup.call(tip);

const coins = Object.keys(data);
// add the line for the first time
gLobalGroup.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")

// X label
// axis labels
const xLabel = gLobalGroup.append("text")
  .attr("class", "x axisLabel")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Time")
const yLable = gLobalGroup.append("text")
  .attr("class", "y axisLabel")
  .attr("transform", "rotate(-90)")
  .attr("y", -60)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Price ($)")

//time label

// axis generators
const xAxisCall = d3.axisBottom(x)
const yAxisCall = d3.axisLeft(y)
  .ticks(6)
  .tickFormat((d) => `${parseInt((Number(d) / 1000).toString())}k`)

const xAxis = gLobalGroup.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate( 0, ' + height + ')');

const yAxis = gLobalGroup.append('g')
  .attr('class', 'y axis');

// event listeners
$("#coin-select").on("change", update);
$("#var-select").on("change", update);

console.log(coins);

const minDates = coins.map((d: string) => d3.min(data[d], (d) => d.date));
const maxDates = coins.map((d: string) => d3.max(data[d], (d) => d.date));

const minDate = minDates.sort()[0]!;
const maxDate = maxDates.sort()[maxDates.length - 1]!;
console.log(minDate, maxDate);

// @ts-ignore
$('#date-slider').slider({
  max: maxDate?.getTime(),
  min: minDate?.getTime(),
  range: true,
  step: 86400000,
  values: [
    minDate.getTime(),
    maxDate.getTime()
  ],
  // @ts-ignore
  slide: (event, ui) => {
    $("#dateLabel1").text(formatTime(new Date(ui.values[0])))
    $("#dateLabel2").text(formatTime(new Date(ui.values[1])))
    update()
  }

});

update();

function update() {
  const transition = d3.transition().duration(100);

  const coin = $("#coin-select").val() as string;
  const yValue = $("#var-select").val() as 'price' | 'market_cap' | '24h_vol';
  // @ts-ignore
  const sliderValues = $("#date-slider").slider("values")
  const dataTimeFiltered = data[coin].filter(d => {
    return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
  })!;

  x.domain(d3.extent(dataTimeFiltered, (d) => d.date) as [Date, Date])
  y.domain([
    d3.min(dataTimeFiltered, d => d[yValue])! / 1.005,
    d3.max(dataTimeFiltered, d => d[yValue])! * 1.005
  ])

  // fix for format values
  const formatSi = d3.format(".2s")
  function formatAbbreviation(x: any) {
    const s = formatSi(x)
    switch (s[s.length - 1]) {
      case "G": return s.slice(0, -1) + "B" // billions
      case "k": return s.slice(0, -1) + "K" // thousands
    }
    return s
  }

  // update axes
  xAxisCall.scale(x)
  xAxis.transition(transition).call(xAxisCall)
  yAxisCall.scale(y)
  yAxis.transition(transition).call(yAxisCall.tickFormat(formatAbbreviation))



  // clear old tooltips
  d3.select(".focus").remove()
  d3.select(".overlay").remove()


  /******************************** Tooltip Code ********************************/

  const focus = gLobalGroup.append("g")
    .attr("class", "focus")
    .style("display", "none")

  focus.append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", height)

  focus.append("line")
    .attr("class", "y-hover-line hover-line")
    .attr("x1", 0)
    .attr("x2", width)
    

  focus.append("circle")
    .attr("r", 7.5)

  focus.append("text")
    .attr("x", 15)
    .attr("dy", ".31em")

  gLobalGroup.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
    .on("mousemove", mousemove)

  function mousemove(event: MouseEvent) {
    console.log(event);

    const x0 = x.invert(d3.pointer(event)[0])
    console.log('x0' , x0);

    const i = bisectDate(dataTimeFiltered, x0, 1)
    console.log(i);
    
    const d0 = dataTimeFiltered[i - 1]
    const d1 = dataTimeFiltered[i]
    console.log(d0, d1);
    i
    // @ts-ignore
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0
    focus.attr("transform", `translate(${x(d.date)}, ${y(d[yValue])})`)
    focus.select("text").text(d[yValue])
    focus.select(".x-hover-line").attr("y2", height - y(d[yValue]))
    focus.select(".y-hover-line").attr("x2", -x(d.date))
  }

  /******************************** Tooltip Code ********************************/

  // Path generator
    
  const line = d3.line()
    .x((d) => {
      return x(d.date)
    })
    .y(d => {
      return y(d[yValue])
    })

  // Update our line path
  gLobalGroup.select(".line")
    .transition(transition)
    .attr("d", line(dataTimeFiltered))

  // Update y-axis label
  const newText = (yValue === "price_usd") ? "Price ($)"
    : (yValue === "market_cap") ? "Market Capitalization ($)"
      : "24 Hour Trading Volume ($)";
  yLable.text(newText)

}