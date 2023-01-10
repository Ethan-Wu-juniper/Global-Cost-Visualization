import { getZoom, drag } from "./svg_utils.js";
import { getCountryCostIndex, CostIndexName } from "./data_utils.js"

let cost_degree, color;
let domain;

const getCityIcon = (path, city_coor, country) => d => {
  let pathCMD = path(city_coor.features.filter(coor => coor.properties.NAME == d && coor.properties.ADM0_A3 == country)[0]);
  if(pathCMD == null)
   return
  console.log(d, pathCMD);
  let locIdx = pathCMD.indexOf("m");
  let iconCMD = pathCMD.substring(1, locIdx);
  let coor = iconCMD.split(",");
  let resultCMD = "M" + iconCMD + "L" + `${coor[0]},${+coor[1]-1}` + "a1,1 0,1,1 1,0" + "Z";
  return resultCMD;
}

const setScale = (scale) => {
  domain = scale;
  cost_degree = d3.scaleLinear()
    .domain(scale)
    .range([-1, 1]);
  color = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(["green", "#fafdbe", "red"]);
}

const show_amount = (selection, country_name, cost, mouseX, mouseY) => {
  
  const rect_size = {width: 300, height: 70};
  let rect_pos;
  if(mouseX < selection.attr("width")/3)
    rect_pos = {x: mouseX, y: mouseY-100}
  else
    rect_pos = {x: mouseX - rect_size.width, y: mouseY-100}
  const InfoG = selection
    .selectAll('#info-rect').data([null])
  const InfoEnter = InfoG.enter().append('svg')
    .merge(InfoG)
    .attr('id', 'info-rect')
    .attr('x', rect_pos.x)
    .attr('y', rect_pos.y)
    .attr('width', rect_size.width)
    .attr('height', rect_size.height);
  const InfoRect = InfoEnter.merge(InfoG)
    .selectAll('rect').data([null]);
  InfoRect.enter().append('rect')
    .merge(InfoRect)
    // .attr('x', rect_pos.x)
    // .attr('y', rect_pos.y)
    .attr('width', rect_size.width)
    .attr('height', rect_size.height)
    .attr('stroke-width', 2)
    .attr("stroke", "black")
    .attr('fill', "white");

  const TextConfig = text => {
    text.attr('font-size', 17)
      .attr('x', rect_size.width/12)
      .style("text-anchor", "start")
      .style("alignment-baseline", "central")
      .style('fill', 'black');
  }
  const InfoText = InfoEnter.merge(InfoG)
    .selectAll('.country_info').data([null]);
  InfoText.enter().append('text')
    .merge(InfoText)
    .attr("class", "country_info")
    .attr('y', rect_size.height/3)
    .call(TextConfig)
    .text(country_name);

  if(cost == undefined)
    cost = "data not found";
  const CostText = InfoEnter.merge(InfoG)
    .selectAll('.cost_info').data([null]);
  CostText.enter().append('text')
    .merge(CostText)
    .attr("class", "cost_info")
    .attr('y', rect_size.height*2/3)
    .call(TextConfig)
    .text("Index : " + cost);
}

const renderMap = (selection, cost_index, alias_map, feature, city_coor, cost_data, city_index) => {
  console.log(cost_data);
  const width = selection.attr("width");
  const height = selection.attr("height");
  
  let country_cost = getCountryCostIndex(
    cost_index,
    alias_map,
    feature
  );
  let sorted_cost = Object.values(country_cost);
  sorted_cost.sort(d3.descending);
  setScale([Math.floor(sorted_cost[sorted_cost.length-1]), Math.floor(sorted_cost[7])])

  var projection = d3.geoMercator()
    .scale(width / 2 / Math.PI - 15)
    .translate([width / 2 - 47, height / 2 + height / 5 - 40]);
  var path = d3.geoPath()
    .projection(projection);
  

    /* https://gist.github.com/almccon/6ab03506d2e3ff9d843f69fa2d5c29cf */
  var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
  Promise.all([
    d3.json(url),
  ]).then(([geojson]) => {
    const mapData = selection.selectAll("#world-map").data([null])
    const world_map = mapData.enter().append("svg")
      .merge(mapData)
      .attr("id", "world-map")
      .attr("viewBox", "0,0,1200,800");
    // let cost_range = d3.extent(Object.values(country_cost), d => d);

    const mapEnter = world_map.selectAll('path').data(geojson.features);
    mapEnter
      .enter().append("path")
      .merge(mapEnter)
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
        let mouse = d3.pointer(event, this.parentNode.parentNode);
        let mouseX = mouse[0];
        let mouseY = mouse[1];
        let country = d3.select(this).attr("id");
        show_amount(selection, d.properties.name, country_cost[country], mouseX, mouseY);
      })
      .on('click', function(_, d){
        let country = d3.select(this).attr("id");
        // console.log(country)
        let cities = city_index.filter(d => alias_map[d.country] == country).map(d => d.city);
        // console.log(cities);
        // cities.forEach(d => console.log(d, 
        //   path(city_coor.features.filter(coor => coor.properties.NAME == d)[0]), 
        //   // city_coor.features.filter(coor => coor.properties.NAME == d),
        //   path(city_coor.features.filter(coor => coor.properties.NAME == d)[0]).indexOf("m"))
        //   )
        const cityEnter = world_map.selectAll(".city").data(cities);
        cityEnter.enter().append("path")
        .merge(cityEnter)
            .attr("class", "city")
            .attr("id", d => d)
            .attr("d", getCityIcon(path, city_coor, country))
            .attr("fill", function() {
              let city = d3.select(this).attr("id");
              let city_row = city_index.filter(d => {
                return d.city == city && alias_map[d.country] == country
              })
              console.log(city, feature, city_row, color(cost_degree(city_row[0][feature])));
              if(city_row.length != 0)
                return color(cost_degree(city_row[0][feature]));
              else
                return "gray";
            });
        cityEnter.exit().remove();

        d3.select(".map")
        // .transition().duration(200)
        .style("width", "fit-content")
        .style("height", "fit-content")
        .style("margin", "10px");
        d3.select(".menu")
        .style("margin", "10px 50px");
        d3.select(".legend")
        .style("top", "45%")
        .style("left", "-50px");
        selection
        .transition().duration(200)
        .attr("width", 750).attr("height", 500);

        d3.selectAll(".country")
          .attr("fill", "#D3D3D3")
      });
    // remove Antarctica from the map
    world_map.select("#Antarctica").remove();
    selection.on("mousedown", function() {
      world_map.classed("dragged", true);
    })
    .on("mouseup", function() {
      world_map.classed("dragged", false);
    });


  })
}

const renderMenu = (selection, props) => {
  const {
    onOptionClicked,
    selectedOption
  } = props;

  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
      .on('change', function() {
        onOptionClicked(this.value);
      });

  const option = select.selectAll('option').data(CostIndexName);
  option.enter().append('option')
    .merge(option)
      .attr('value', d => d)
      .property('selected', d => d === selectedOption)
      .text(d => d);
}

const renderLegend = (domain) => {
  /* https://blog.scottlogic.com/2019/03/13/how-to-create-a-continuous-colour-range-legend-using-d3-and-d3fc.html */
  /* https://github.com/d3fc/d3fc/blob/master/README.md */
  // let legend = d3.select(".map").append("div")
  //   .attr("class", "legend");
  let legendData = d3.select(".map").selectAll(".legend").data([null]);
  let legend = legendData.enter().append("div")
    .merge(legendData)
      .attr("class", "legend");
  // Band scale for x-axis
  const legend_size = {"width": 200, "height" : 50}
  // let domain = [17, 86];
  // Linear scale for y-axis
  const xScale = d3
    .scaleLinear()
    .domain(domain)
    .range([0, legend_size.width]);
  const yScale = d3
    .scaleBand()
    .domain([0, 1])
    .range([0, legend_size.height]);

  let min = domain[0], max = domain[1];
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
    .decorate(world_map => {
      world_map.selectAll("path").style("fill", d => (d>min) ? color(cost_degree(d)) : "none");
    });

  // Drawing the legend bar
  const legendEnter = legend.selectAll("svg").data([null]);
  const legendSvg = legendEnter.enter().append("svg")
  .merge(legendEnter)
  // const legendSvg = legend.append("svg")
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
  const axisEnter = legendSvg.selectAll(".legend-axis").data([null]);
  axisEnter.enter().append("g")
  .merge(axisEnter)
  // legendSvg.append("g")
    .attr("class", "legend-axis")
    .attr("transform", `translate(100,${barHeight/2})`)
    .datum(expandedDomain)
    .call(axisLabel);
}

export const renderMainPage = (selection, cost_index, alias_map, city_coor, cost_data, city_index) => {
  const svg = selection.select('svg');
  svg.attr("height", svg.attr("width") * 2 / 3);
  // setScale([17,86]);
  renderMap(svg, cost_index, alias_map, "Cost of Living Index", city_coor, cost_data, city_index);
  const onOptionClicked = option => {
    // domain = option=='Rent Index'?[0, 30]:[17,86];
    // setScale(domain);
    renderMap(svg, cost_index, alias_map, option, city_coor, cost_data, city_index);
    renderLegend(domain);
  }
  svg.node().addEventListener('wheel', getZoom("world-map"), true);
  svg.node().addEventListener('mousemove', drag, true);

  const menu = selection.select("#index-menu");
  renderMenu(menu, {
    onOptionClicked: onOptionClicked,
    selectedOption: "Cost of Living Index"
  });
  renderLegend(domain);
}