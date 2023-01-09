export const getCountryCost = (cost_data, features, alias, group_by = null) => {
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
      key = alias[key]==undefined ? key : alias[key];
      cost[key] = d3.mean(values, d => d.cost);
    })
    return cost;
  }
}

export const getCountryCostIndex = (cost_index, alias, feature) => {
  let cost = {};
  cost_index.forEach(el => {
    if(el.Country.includes("(")) {
      let stripIdx = el.Country.indexOf("(")-1;
      el.Country = el.Country.substring(0, stripIdx);
    }
    let country = alias[el.Country]==undefined?el.Country:alias[el.Country];
    cost[country] = +el[feature];
  })
  return cost;
}

export const CostIndexName = [
  "Cost of Living Index",
  "Rent Index",
  "Cost of Living Plus Rent Index",
  "Groceries Index",
  "Restaurant Price Index",
  "Local Purchasing Power Index"
]

export const getCityCoordinate = city_data => {
  let city_coor = {};
  city_data.features.forEach(d => {
    city_coor[d.properties.NAME] = d.geometry.coordinates;
  });
  return city_coor;
}