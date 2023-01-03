/* https://gist.github.com/almccon/6ab03506d2e3ff9d843f69fa2d5c29cf */

const getCost = (cost_data, features, group_by=null) => {
  let cost = [];

  cost_data.forEach(element => {
    let sum = 0;
    features.forEach(feature => sum += +element[feature]);
    cost.push({
      "country":element["country"],
      "city":element["city"],
      "cost":sum
    });
  });
  if(group_by == null)
    return cost;
  else if(group_by == "country") {
    let costG = d3.group(cost, d => d.country);

    cost = {};
    Array.from(costG, ([key, values]) => {
      // console.log(key, values);
      cost[key] = {"cost" : d3.sum(values, d => d.cost)};
    })
  
    return cost;
  }

}

export const renderMap = (selection, cost_data) => {
  let cost = getCost(cost_data, cost_data.columns.filter(d => d[0] == "x"), "country");
  // console.log("cost", cost);
  let cost_range = d3.extent(Object.values(cost), d => d.cost);
  console.log(cost_range);

  const width = selection.attr("width");
  const height = selection.attr("height");

  var projection = d3.geoMercator()
    .scale(width / 2 / Math.PI)
    //.scale(100)
    .translate([width / 2, height / 2 + height / 5]);

  var path = d3.geoPath()
    .projection(projection);

  var cost_degree = d3.scaleLinear()
    .domain(cost_range)
    .range([-1, 1]);
  var color = d3.scaleLinear()
    // .domain([cost_range[1], (cost_range[0]+cost_range[1])/2, cost_range[0]])
    .domain([-1, 0, 1])
    .range(["red", "yellow", "green"]);


  var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
  d3.json(url).then(
    geojson => {
    // console.log(geojson);
    selection.selectAll('path').data(geojson.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("id", d => d.properties.name)
      .attr("d", path);

    // remove Antarctica from the map
    selection.select("#Antarctica").remove();

    Object.keys(cost).forEach(country => {
      console.log(country, cost[country].cost);
      console.log(cost_degree(cost[country].cost));
      console.log(color(cost_degree(cost[country].cost)));

      if(country == "United States") {
        selection.select(`#USA`)
        .attr("fill", color(cost_degree(cost[country].cost)));
      }
      selection.select(`#${country}`)
        .attr("fill", color(cost_degree(cost[country].cost)));
        // .attr("fill", "red");
    })

    console.log([cost_range[1], (cost_range[0]+cost_range[1])/2, cost_range[0]]);
  })
}