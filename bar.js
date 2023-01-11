const columnXIndex = (start, length) => Array.from( {length}, (_, i) => `x${i + start}` );

const barCategory = [
  "restaurant",
  "market",
  "transportation",
  "utility",
  "sportAndLeisure",
  "childcare",
  "clothing",
  "rent",
  "house",
  "salary"
];

function rankings(array) {
  return array
    .map((v, i) => [v, i])
    .sort((a, b) => b[0] - a[0])
    .map((a, i) => [...a, i + 1])
    .sort((a, b) => a[1] - b[1])
    .map(a => a[2]);
}

// const getAllRanking = (data) => ;

export const categoryAttribute = {
  restaurant: columnXIndex(1, 8),
  market: columnXIndex(9, 20),
  transportation: columnXIndex(28, 8),
  utility: columnXIndex(36, 3),
  sportAndLeisure: columnXIndex(39, 3),
  childcare: columnXIndex(42, 2),
  clothing: columnXIndex(44, 4),
  rent: columnXIndex(48, 4),
  house: columnXIndex(52, 2),
  salary: columnXIndex(54, 2)
};

// const barScaleCategory = (data) => {
//   const sumCategory = {};
//   barCategory.forEach(e => sumCategory[e] = 0.0);
//   data.forEach(row => {
//     Object.entries(categoryAttribute).forEach(([k, v]) =>
//     v.forEach(attr => sumCategory[k] += row[attr]))
//   })
// }
const categorySumValue = cate => row => categoryAttribute[cate].reduce((p, c) => p + +row[c], 0);

const barScaleCategory = (data, range) => Object.fromEntries(
  barCategory.map(e => [
    e,
    d3.scaleLinear()
      .domain(d3.extent(data, categorySumValue(e)))
      .range(range)
  ])
);

export const attributeCostOfLiving = columnXIndex(1, 55);

export class barChart {
  constructor(data) {
    this.rawData = data;
    this.svg = d3.selectAll('.bar').append('svg').attr('width', 1500).attr('height', 600);
    this.hide();

    this.width = +this.svg.attr('width');
    this.height = +this.svg.attr('height');
    this.margin = {top: 80, right: 80, bottom: 40, left:40}
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.categoryLocalRange = [0, 1];
    this.categoryScale = barScaleCategory(this.rawData, [this.innerHeight, 0]);

    this.xDomain = barCategory;
    // const xDomain = categoryAttribute[category];

    // this.data = processData(rawData, name);
    this.xScale = d3.scaleBand()
    .domain(this.xDomain)
    .range([0, this.innerWidth]);

    this.yScale = d3.scaleLinear()
      .domain(this.categoryLocalRange)
      .range([this.innerHeight, 0])

    this.slotBetweenAttr = 5;
    this.barTotalWidth = this.innerWidth / this.xDomain.length - this.slotBetweenAttr;

    this.xzScale = d3.scaleBand()
      // .domain(name)
      .range([0, this.barTotalWidth])

    this.zScale = d3.scaleOrdinal()
      // .domain(name)
      .range(d3.schemeTableau10)
        
    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // const legend = g.selectAll('text').data(name).join('text')
    //   .attr('fill', d => zScale(d))
    //   .attr('y', (_, i) => 30*i)
    //   .text(d => d)

    this.xAxisG = this.g.append('g')
      .call(d3.axisBottom(this.xScale))
      .attr('transform', `translate(0,${this.innerHeight})`);

    this.yAxisG = this.g.append('g')
      .call(d3.axisLeft(this.yScale))

    this.nameList = [];
    this.barData = [];
    this.bar = this.g;
    this.legend = this.g
  }

  show() {
    this.svg.attr('display', null);
  }

  hide() {
    this.svg.attr('display', 'none');
  }

  addCity(...names) {
    var addNames = names.filter(name => !this.nameList.includes(name))
    this.nameList.push(...addNames);
    this.barData.push(...processData(this.rawData, addNames));
    this.updateBar();
  }

  deleteCity(name) {
    var idx = this.nameList.indexOf(name);
    this.nameList.splice(idx, 1);
    this.barData.splice(idx * this.xDomain.length, this.xDomain.length);
    this.updateBar();
  }

  clearCities() {
    this.nameList = [];
    this.barData = [];
    this.updateBar();
  }

  updateBar() {
    this.xzScale.domain(this.nameList);
    this.zScale.domain(this.nameList);
    this.bar.selectAll('rect').data(this.barData)
      .join('rect')
      // .transition().duration(500)
        .attr('id', (d, i) => `bar-${i}`)
        .attr('x', d => this.xScale(d.attr) + this.xzScale(d.name) + this.slotBetweenAttr / 2)
        .attr('y', d => this.categoryScale[d.attr](d.value))
        .attr('width', this.xzScale.bandwidth())
        .attr('height', d => this.categoryScale[d.attr](this.categoryScale[d.attr].domain()[0]) - this.categoryScale[d.attr](d.value))
        .attr('fill', d => this.zScale(d.name))
    this.legend.selectAll('text.bar-legend').data(this.nameList)
      .join('text')
      .attr('class', 'bar-legend')
      .attr('fill', d => this.zScale(d))
      .attr('y', (_, i) => 30*i)
      .text(d => d)
      .on('click', (_, d) => { this.deleteCity(d); })

  }
}

export const processData = (data, name, attr=attributeCostOfLiving) => 
  data.filter(d => name.includes(d.city))
    .reduce((prev, curr) => {
      if(attr === attributeCostOfLiving){
        Object.entries(categoryAttribute).forEach(([k, v]) => {
          prev.push({
            name: curr.city,
            attr: k,
            value: v.reduce((vPrev, vCurr) => vPrev + +curr[vCurr], 0)
          })
        })
      }
      else {
        attr.forEach(attr => {
          prev.push({
            name: curr.city,
            attr,
            value: curr[attr]
          })
        })
      }
      return prev;
    }, []);
