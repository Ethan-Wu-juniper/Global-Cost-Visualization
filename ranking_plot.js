import { categoryAttribute } from "./bar.js";
export class ranking_plot {
  constructor() {
    this.width = 700;
    this.height = 450;
    this.svg = d3.select('.ranking-plot').append('svg')
      .attr('width', this.width).attr('height', this.height).attr('display', 'none');
    this.margin = {top: 70, right: 30, left: 100, bottom: 30};
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.xScale = d3.scaleLinear()
      .domain([910, 1])
      .range([0, this.innerWidth]);

    this.yScale = d3.scaleBand()
      .domain(Object.keys(categoryAttribute))
      .range([0, this.innerHeight])

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.g.append('g')
      .call(d3.axisBottom(this.xScale).tickValues([901, 801, 701, 601, 501, 401, 301, 201, 101, 1]))
      .attr('transform', `translate(0,${this.innerHeight})`);

    this.g.append('g')
      .call(d3.axisLeft(this.yScale).tickSize(-this.innerWidth))
  }

  update_plot(data) {
    this.svg.attr('display', null);
    this.g.selectAll('circle').data(data)
      .join('circle')
      .transition().duration(500)
      .attr('cx', d => this.xScale(d[1]))
      .attr('cy', d => this.yScale(d[0]) + 17.5)
      .attr('r', 6)
      .attr('fill',  d => {
        var rate = d[1] / 910;
        console.log(rate);
        if(rate <= 0.2)
          return "red";
        if(rate >= 0.8)
          return "green";
        return null;
      })
  }
}