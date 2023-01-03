import { renderMap } from './map.js'

let cost_data;

var svg = d3.select('svg');
svg.attr("height", svg.attr("width") * 2 / 3);



d3.csv("cost/cost-of-living.csv").then(loaddata => {
  cost_data = loaddata;
  console.log(cost_data.columns);
  console.log(cost_data);

  // let cost = getCost(cost_data, cost_data.columns.filter(d => d[0] == "x"));
  // console.log(cost);
  renderMap(svg, cost_data);
})







