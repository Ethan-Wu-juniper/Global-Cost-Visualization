import { renderMap } from './map.js'

let cost_data;

var svg = d3.select('svg');
svg.attr("height", svg.attr("width") * 2 / 3);



Promise.all([
  d3.csv("cost/cost-of-living.csv"),
  d3.csv("cost_index/const_index.csv")
]).then(([cost_data, cost_index]) => {
  // console.log(cost_data.columns);
  // console.log(cost_data);

  // let cost = getCost(cost_data, cost_data.columns.filter(d => d[0] == "x"));
  // console.log(cost);
  renderMap(svg, cost_data);
})


// d3.csv("./test/country_alias.csv").then(alias => {
//   let alias_map = {};
//   alias.forEach(
//     el => {
//       alias_map[el.Alias] = el.iso3;
//     }
//   )
//   console.log(alias_map);
// })