import { renderMainPage } from './map.js'
import { getCityCoordinate } from './data_utils.js';

const GetAliasMap = alias => {
  let alias_map = {};
  alias.forEach(el => { alias_map[el.Alias] = el.iso3; })
  return alias_map;
}
    
Promise.all([
  d3.csv("./cost/cost-of-living.csv"),
  d3.csv("./cost_index/cost_index.csv"),
  d3.csv("./country_alias/country_alias.csv"),
  d3.json("./city/city.json")
]).then(([cost_data, cost_index, alias, city_data]) => {
  let alias_map = GetAliasMap(alias);
  let city_coor = getCityCoordinate(city_data);
  console.log(city_data);

  renderMainPage(d3.select("body"), cost_index, alias_map, city_data, cost_data);
})
