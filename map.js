/* https://gist.github.com/almccon/6ab03506d2e3ff9d843f69fa2d5c29cf */

const show_amount = (selection, info, mouseX, mouseY) => {
  const InfoG = selection
    .selectAll('#info-rect').data([null])
  const InfoEnter = InfoG.enter().append('g')
    .merge(InfoG)
    .attr('id', 'info-rect')
    .attr('transform', `translate(0, 0)`);

  const rect_size = {x: mouseX, y: mouseY-60, width: 100, height: 50}
  const InfoRect = InfoEnter.merge(InfoG)
    .selectAll('rect').data([null]);
  InfoRect.enter().append('rect')
    .merge(InfoRect)
    .attr('x', rect_size.x)
    .attr('y', rect_size.y)
    .attr('width', rect_size.width)
    .attr('height', rect_size.height)
    .attr('stroke-width', 2)
    .attr('opacity', 0.5);
  const InfoText = InfoEnter.merge(InfoG)
    .selectAll('text').data([null]);
  InfoText.enter().append('text')
    .merge(InfoText)
    .attr('x', rect_size.x + rect_size.width/2)
    .attr('y', rect_size.y + rect_size.height/2)
    .attr('font-size', 30)
    .style("text-anchor", "middle")
    .style("alignment-baseline", "central")
    .style('fill', 'white')
    .text(info);
}

export const renderMap = (selection, country_cost, alias_map) => {
  const width = selection.attr("width");
  const height = selection.attr("height");

  var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
  Promise.all([
    d3.json(url),
  ]).then(([geojson]) => {
    
    let cost_range = d3.extent(Object.values(country_cost), d => d);
    console.log("cost", country_cost);
    console.log("cost range", cost_range);

    var projection = d3.geoMercator()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2 + height / 5]);

    var path = d3.geoPath()
      .projection(projection);

    var cost_degree = d3.scaleLinear()
      // .domain(cost_range)
      .domain([17, 86])
      .range([-1, 1]);
    var color = d3.scaleLinear()
      // .domain([cost_range[1], (cost_range[0]+cost_range[1])/2, cost_range[0]])
      .domain([-1, 0, 1])
      .range(["green", "white", "red"]);
      // .range(["#009747", "#fafdbe", "#d23d33"]);



    // console.log(alias_map);
    // (geojson) => {
    // console.log(geojson);
    selection.selectAll('path').data(geojson.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("id", d => alias_map[d.properties.name]==undefined?d.properties.name:alias_map[d.properties.name])
      .attr("d", path)
      .attr("fill", "gray")
      .on("mouseover", function(_, d) {
        d3.select(this).attr('opacity', 0.85);
        d3.select(this).attr('stroke-width', 2);
        document.body.style.cursor = "pointer";
      })
      .on('mouseout', function(_, d) {
        d3.select(this).attr('opacity', 1);
        d3.select(this).attr('stroke-width', 1);
        document.body.style.cursor = "default";
        d3.selectAll('#info-rect').remove()
      });

    // remove Antarctica from the map
    selection.select("#Antarctica").remove();

    Object.keys(country_cost).forEach(country => {
      console.log(country, country_cost[country]);
      console.log(cost_degree(country_cost[country]));
      console.log(color(cost_degree(country_cost[country])));

      // if(country == "United States") {
      //   selection.select(`#USA`)
      //   .attr("fill", color(cost_degree(cost[country])));
      // }
      // country = alias_map[country];
      // console.log(country)
      selection.select(`#${country}`)
        .attr("fill", color(cost_degree(country_cost[country])))
        .on('mousemove', d => {
          let mouse = d3.pointer(event);
          let mouseX = mouse[0];
          let mouseY = mouse[1];
          show_amount(selection, country_cost[country], mouseX, mouseY);
        });
      // .attr("fill", "red");
    })
  })
}