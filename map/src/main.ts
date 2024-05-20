import './style.css'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

const width = 600,
  height = 400;

// const projection = d3.geoConicEqualArea()
const projection = d3.geoMercator()
  .scale(153)
  .translate([width / 2, height / 2])
  .precision(.1);

const path = d3.geoPath()
  .projection(projection);

const graticule = d3.geoGraticule()();

const svg = d3.select("#chart-area").append("svg")
  .attr("width", width)
  .attr("height", height);

// const data = d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
const world = await d3.json('/data/world-110m.json') as any;

console.log(world)
console.log(topojson.feature(world, world.objects.land));
console.log(graticule)

svg.append("path")
  .datum(topojson.feature(world, world.objects.land))
  .attr("class", "land")
  .attr("d", path);

svg.append("path")
  .datum(topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; }))
  .attr("class", "boundary")
  .attr("d", path);

svg.append("path")
  .datum(graticule)
  .attr("class", "graticule")
  .attr("d", path);

d3.select(self.frameElement).style("height", height + "px");