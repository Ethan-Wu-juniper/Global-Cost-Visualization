import { renderMap } from './map.js'

let cost_data;

var svg = d3.select('svg');
svg.attr("height", svg.attr("width") * 2 / 3);

const GetAliasMap = alias => {
  let alias_map = {};
  alias.forEach(el => { alias_map[el.Alias] = el.iso3; })
  return alias_map;
}

const getCountryCost = (cost_data, features, alias, group_by = null) => {
  let cost = [];

  cost_data.forEach(element => {
    let sum = 0;
    features.forEach(feature => sum += +element[feature]);
    cost.push({
      "country": element["country"],
      "city": element["city"],
      "cost": sum
    });
  });
  if (group_by == null)
    return cost;
  else if (group_by == "country") {
    let costG = d3.group(cost, d => d.country);

    cost = {};
    Array.from(costG, ([key, values]) => {
      // console.log(alias[key], values);
      key = alias[key]==undefined ? key : alias[key];
      cost[key] = d3.mean(values, d => d.cost);
    })
    return cost;
  }
}

const getCountryCostIndex = (cost_index, alias) => {
  let cost = {};
  cost_index.forEach(el => {
    if(el.Country.includes("(")) {
      let stripIdx = el.Country.indexOf("(")-1;
      el.Country = el.Country.substring(0, stripIdx);
      console.log(stripIdx, el.Country);
    }
    let country = alias[el.Country]==undefined?el.Country:alias[el.Country];
    cost[country] = +el["Cost of Living Index"];
  })
  return cost;
}
    
Promise.all([
  d3.csv("./cost/cost-of-living.csv"),
  d3.csv("./cost_index/cost_index.csv"),
  d3.csv("./country_alias/country_alias.csv")
]).then(([cost_data, cost_index, alias]) => {
  // console.log(cost_data.columns);
  // console.log(cost_index);

  // let cost = getCost(cost_data, cost_data.columns.filter(d => d[0] == "x"));
  // console.log(cost);
  let alias_map = GetAliasMap(alias)
  let country_cost = getCountryCost(
    cost_data,
    cost_data.columns.filter(d => d[0] == "x"),
    alias_map,
    "country"
  );

  let country_cost_index = getCountryCostIndex(
    cost_index,
    alias_map
  );

  renderMap(svg, country_cost_index, alias_map);
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