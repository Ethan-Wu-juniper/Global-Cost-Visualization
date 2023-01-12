import { renderMainPage } from './map.js'
import { getCityCoordinate } from './data_utils.js';
import { barChart } from './bar.js'
import { renderHeatmap } from './heatmap.js';

const GetAliasMap = alias => {
  let alias_map = {};
  alias.forEach(el => { alias_map[el.Alias] = el.iso3; })
  return alias_map;
}
    
Promise.all([
  d3.csv("./cost/cost-of-living.csv"),
  d3.csv("./cost_index/cost_index.csv"),
  d3.csv("./country_alias/country_alias.csv"),
  d3.json("./city/city.json"),
  d3.csv("./cost_index/city_index.csv"),
  d3.json("./cost/description.json"),
]).then(([cost_data, cost_index, alias, city_data, city_index, cost_description]) => {
  let alias_map = GetAliasMap(alias);
  let city_coor = getCityCoordinate(city_data);
  // console.log(city_data);
  cost_data = cost_data.filter(d => d.data_quality == 1);
  // console.log(city_index);
  city_index.forEach(d => {
    // console.log(d.City)
    let cc = d.City.split(",");
    d["city"] = cc[0].trim();
    d["country"] = cc[cc.length-1].trim();
  })
  console.log(city_index);

  const bar = new barChart(cost_data, cost_description);
  renderMainPage(d3.select("body"), cost_index, alias_map, city_data, cost_data, city_index, bar);
  renderHeatmap(cost_data, cost_description);
})
