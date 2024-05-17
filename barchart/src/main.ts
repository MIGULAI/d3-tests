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
g.append("text")
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
  .domain(data.map((d) => d.month))
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.2);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, (d) => d.revenue)!])
  .range([height, 0]);

const xAxisCall = d3.axisBottom(x);

g.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate( 0, ' + height + ')')
  .call(xAxisCall)
  .selectAll('text')
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)")

const yAxisCall = d3.axisLeft(y)
  .ticks(3)
  .tickFormat((d) => d + 'm');

g.append('g')
  .attr('class', 'y axis')
  .call(yAxisCall)


const rects = g.selectAll('rect').data(data);

rects.enter().append('rect')
  .attr('x', (d) => x(d.month) as number)
  .attr('y', (d) => y(d.revenue ))
  .attr('width', x.bandwidth())
  .attr('height', (d) => height - y(d.revenue))
  .attr('fill', 'gray')