/* https://gist.github.com/almccon/6ab03506d2e3ff9d843f69fa2d5c29cf */

const show_amount = (selection, country_name, cost, mouseX, mouseY) => {
  const InfoG = selection
    .selectAll('#info-rect').data([null])
  const InfoEnter = InfoG.enter().append('g')
    .merge(InfoG)
    .attr('id', 'info-rect')
    .attr('transform', `translate(0, 0)`);

  const rect_size = {width: 300, height: 70};
  let rect_pos;
  if(mouseX < selection.attr("width")/3)
    rect_pos = {x: mouseX, y: mouseY-80}
  else
    rect_pos = {x: mouseX - rect_size.width, y: mouseY-80}
  const InfoRect = InfoEnter.merge(InfoG)
    .selectAll('rect').data([null]);
  InfoRect.enter().append('rect')
    .merge(InfoRect)
    .attr('x', rect_pos.x)
    .attr('y', rect_pos.y)
    .attr('width', rect_size.width)
    .attr('height', rect_size.height)
    .attr('stroke-width', 2)
    .attr("stroke", "black")
    .attr('fill', "white");

  const TextConfig = text => {
    text.attr('font-size', 17)
      .attr('x', rect_pos.x + rect_size.width/12)
      .style("text-anchor", "start")
      .style("alignment-baseline", "central")
      .style('fill', 'black');
  }
  const InfoText = InfoEnter.merge(InfoG)
    .selectAll('.country_info').data([null]);
  InfoText.enter().append('text')
    .merge(InfoText)
    .attr("class", "country_info")
    .attr('y', rect_pos.y + rect_size.height/3)
    .call(TextConfig)
    .text(country_name);

  if(cost == undefined)
    cost = "data not found";
  const CostText = InfoEnter.merge(InfoG)
    .selectAll('.cost_info').data([null]);
  CostText.enter().append('text')
    .merge(CostText)
    .attr("class", "cost_info")
    .attr('y', rect_pos.y + rect_size.height*2/3)
    .call(TextConfig)
    .text("Cost of Living Index : " + cost);
}

export const renderMap = (selection, country_cost, alias_map) => {
  const width = selection.attr("width");
  const height = selection.attr("height");

  var projection = d3.geoMercator()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2 + height / 5]);
  var path = d3.geoPath()
    .projection(projection);
  var cost_degree = d3.scaleLinear()
    .domain([17, 86])
    .range([-1, 1]);
  var color = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(["green", "#fafdbe", "red"]);

  var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
  Promise.all([
    d3.json(url),
  ]).then(([geojson]) => {
    // let cost_range = d3.extent(Object.values(country_cost), d => d);
    selection.selectAll('path').data(geojson.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("id", d => alias_map[d.properties.name]==undefined?d.properties.name:alias_map[d.properties.name])
      .attr("d", path)
      .attr("fill", function() {
        let country = d3.select(this).attr("id");
        if(country in country_cost)
          return color(cost_degree(country_cost[country]));
        else
          return "gray";
      })
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
      })
      .on('mousemove', function(_, d) {
        let mouse = d3.pointer(event);
        let mouseX = mouse[0];
        let mouseY = mouse[1];
        let country = d3.select(this).attr("id");
        show_amount(selection, d.properties.name, country_cost[country], mouseX, mouseY);
      });
    // remove Antarctica from the map
    selection.select("#Antarctica").remove();
  })

  /* https://blog.scottlogic.com/2019/03/13/how-to-create-a-continuous-colour-range-legend-using-d3-and-d3fc.html */
  /* https://github.com/chrisprice/d3fc-series */
  let legend = d3.select("body").append("div")
    .attr("class", "legend");
  // Band scale for x-axis
  const legend_size = {"width": 200, "height" : 50}
  let domain = [17, 86];
  // Linear scale for y-axis
  const xScale = d3
    .scaleLinear()
    .domain(domain)
    .range([0, legend_size.width]);
  const yScale = d3
    .scaleBand()
    .domain([0, 1])
    .range([0, legend_size.height]);

  let min = 17, max = 86;
  const expandedDomain = d3.range(min, max, (max - min) / legend_size.width);

  // Defining the legend bar
  const svgBar = fc
    .autoBandwidth(fc.seriesSvgBar())
    .xScale(xScale)
    .yScale(yScale)
    .orient('horizontal')
    .crossValue(0)
    .baseValue((_, i) => (i > 0 ? expandedDomain[i - 1] : 0))
    .mainValue(d => d)
    .decorate(selection => {
      selection.selectAll("path").style("fill", d => (d>17) ? color(cost_degree(d)) : "none");
    });

  // Drawing the legend bar
  const legendSvg = legend.append("svg")
    .attr("width", legend_size.width+200)
    .attr("height", legend_size.height);
  const legendBar = legendSvg
    .append("g")
    .datum(expandedDomain)
    .call(svgBar)
    .attr("transform", `translate(100, 0)`);

  const axisLabel = fc
    .axisBottom(xScale)
    .tickValues([...domain, (domain[1] + domain[0]) / 2]);

  // Drawing and translating the label
  const barHeight = Math.abs(legendBar.node().getBoundingClientRect().height);
  // console.log(legendBar.node().getBoundingClientRect())
  legendSvg.append("g")
    .attr("transform", `translate(100,${barHeight/2})`)
    .datum(expandedDomain)
    .call(axisLabel);
}