import { attributeCostOfLiving } from "./bar.js";
export const pcorr = (x, y) => {
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumY2 = 0;
    const minLength = x.length = y.length = Math.min(x.length, y.length),
      reduce = (xi, idx) => {
        const yi = y[idx];
        sumX += xi;
        sumY += yi;
        sumXY += xi * yi;
        sumX2 += xi * xi;
        sumY2 += yi * yi;
      }
    x.forEach(reduce);
    return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
  };

export const getCorrelationMatrix = data => {
  var columnValue = Object.fromEntries(attributeCostOfLiving.map(attr =>
    [attr, data.map(row => +row[attr])]
  ));
  console.log(columnValue);
  // const matrix = new Array(55).fill(0).map(() => new Array(55).fill(0));
  const matrix = [];
  for(var i = 0; i < 55; i++){
    var aName = `x${i+1}`;
    var aCol = columnValue[aName];
    for(var j = i ; j < 55; j++){
      var bName = `x${j+1}`;
      var bCol = columnValue[bName];
      // matrix[i][j] = pcorr(aCol, bCol);
      matrix.push({
        row: aName,
        col: bName,
        value: pcorr(aCol, bCol)
      })
    }
  }
  return matrix;
}

export const renderHeatmap = (data, description) => {
  const matrix = getCorrelationMatrix(data);
  // set the dimensions and margins of the graph
  const margin = {top: 80, right: 25, bottom: 50, left: 40},
  width = 900 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(attributeCostOfLiving)
    .padding(0.05);
  const xAxisG = svg.append("g")
    .style("font-size", 15)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
  xAxisG.selectAll("text")
    .attr("transform", `rotate(60)`)
    .attr("dx", "1em")
    .attr("dy", "0.5em")
    .attr("text-anchor", "start");
  xAxisG.select(".domain").remove()

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(attributeCostOfLiving)
    .padding(0.05);
  const yAxisG = svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // const myColor = d3.scaleSequential()
  //   .interpolator(d3.interpolateInferno)
  //   .domain([-1, 1])
  const myColor = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(["red", "white", "blue"]);

  const tooltip = d3.select("#heatmap")
    .append("div")
    .style("visibility", "hidden")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {
    tooltip
      .style("visibility", null)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  const mousemove = function(event,d) {
    tooltip
      .html(`Correlation: ${d.value}<br>${d.col}: ${description[d.col]}<br>${d.row}: ${description[d.row]}`)
      .style("left", (event.offsetX) + 8 + "px")
      .style("top", (event.offsetY) + 8 + "px")
  }
  const mouseleave = function(event,d) {
    tooltip
      .style("visibility", "hidden")
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }


  svg.selectAll("rect")
    // .data(data, function(d) {return d.group+':'+d.variable;})
    .data(matrix)
    .join("rect")
      .attr("x", function(d) { return x(d.row) })
      .attr("y", function(d) { return y(d.col) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.value)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
}