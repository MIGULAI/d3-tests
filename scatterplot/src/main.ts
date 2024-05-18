import './style.css';
import * as d3 from 'd3';

type Data = {
  month: string;
  revenue: number;
  profit: number;
}

const margin = { top: 10, right: 10, bottom: 150, left: 100 };

const height = 400 - margin.top - margin.bottom;
const width = 600 - margin.left - margin.right;

let flag = true;

const canvas = d3.select('#chart-area')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

const g = canvas.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// X label
g.append("text")
  .attr("class", "x axis-label")
  .attr("x", width / 2)
  .attr("y", height + 110)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Month")

// Y label
const yLabel = g.append("text")
  .attr("class", "y axis-label")
  .attr("x", - (height / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Revenue ")

const data = await d3.csv('data/revenues.csv').then((data: any) => {
  console.log(data);

  data.forEach((data: any) => {
    data.profit = Number(data.profit);
    data.revenue = Number(data.revenue);
  });
  return data as Data[];
});


const x = d3.scaleBand()
  // .domain(data.map((d) => d.month))
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.2);

const y = d3.scaleLinear()
  // .domain([0, d3.max(data, (d) => d.revenue)!])
  .range([height, 0]);

const xAxisGroup = g.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate( 0, ' + height + ')')

const yAxisGroup = g.append('g')
  .attr('class', 'y axis')

d3.interval(() => {
  flag = !flag;
  const formatedData = flag ? data : data.slice(1);
  update(formatedData)

}, 1000);

update(data);

function update(data: Data[]) {
  const value = flag ? 'revenue' : 'profit';

  const transition = d3.transition().duration(500);

  x.domain(data.map((d) => d.month));
  y.domain([0, d3.max(data, (d) => d[value])!]);

  const xAxisCall = d3.axisBottom(x);

  const yAxisCall = d3.axisLeft(y)
    .ticks(3)
    .tickFormat((d) => '$' + d);


  xAxisGroup.transition(transition)
    .call(xAxisCall)
    .selectAll('text')
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)");


  yAxisGroup.transition(transition)
    .call(yAxisCall);

  /**
   * D3 Update Pattern
   */

  // JOIN new data with old elements.
  const circles = g.selectAll('circle').data(data, (d: any) => d.month);

  // EXIT old elements not present in new data.
  circles.exit()
    .attr('fill', 'red')
    .transition(transition)
    .attr('cy', y(0))
    .remove();

  // ENTER new elements present in new data...
  circles.enter().append("circle")
    .attr("fill", "grey")
    .attr("cy", y(0))
    .attr('r', 5)
    // AND UPDATE old elements present in new data.
    .merge(circles as any)
    .transition(transition)
      .attr("cx", (d) => x(d.month)! + x.bandwidth() / 2)
      .attr("cy", d => y(d[value]))



  const label = flag ? 'Revenue' : 'Profit';

  yLabel
    .text(label)
}