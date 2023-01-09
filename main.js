import { renderMainPage } from './map.js'

const GetAliasMap = alias => {
  let alias_map = {};
  alias.forEach(el => { alias_map[el.Alias] = el.iso3; })
  return alias_map;
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
  // let country_cost = getCountryCost(
  //   cost_data,
  //   cost_data.columns.filter(d => d[0] == "x"),
  //   alias_map,
  //   "country"
  // );

  renderMainPage(d3.select("body"), cost_index, alias_map);
})
