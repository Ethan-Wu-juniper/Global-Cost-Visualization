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

const getAllRanking = (data) => Object.fromEntries(
  barCategory.map(cate => [
    cate,
    rankings(data.map(row => categorySumValue(cate)(row))
)]));

export const categoryAttribute = {
  restaurant: columnXIndex(1, 8),
  market: columnXIndex(9, 19),
  transportation: columnXIndex(28, 8),
  utility: columnXIndex(36, 3),
  sportAndLeisure: columnXIndex(39, 3),
  childcare: columnXIndex(42, 2),
  clothing: columnXIndex(44, 4),
  rent: columnXIndex(48, 4),
  house: columnXIndex(52, 2),
  salary: columnXIndex(54, 2)
};

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

const barScaleAllAttr = (data, range) => Object.fromEntries(
  attributeCostOfLiving.map(attr => [
    attr,
    d3.scaleLinear()
      .domain(d3.extent(data, d => +d[attr]))
      .range(range)
  ])
);

export class barChart {
  constructor(data, description) {
    this.rawData = data;
    this.description = description;
    this.categoryRanking = getAllRanking(data);
    this.div = d3.selectAll('.bar');
    d3.select('.detail').style('display', 'none');
    this.rankingDiv = d3.select('.ranking');
    this.svg = this.div.append('svg').attr('width', 1600).attr('height', 400);
    this.hide();

    this.width = +this.svg.attr('width');
    this.height = +this.svg.attr('height');
    this.margin = {top: 30, right: 80, bottom: 80, left:140}
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.categoryLocalRange = [0, 1];
    this.categoryScale = barScaleCategory(this.rawData, [this.innerHeight, 0]);
    this.allAttrScale = barScaleAllAttr(this.rawData, [this.innerHeight, 0]);
    // console.log(this.allAttrScale)
    this.yScale = this.categoryScale;
    this.mode = "all";

    this.xDomain = barCategory;
    // const xDomain = categoryAttribute[category];

    // this.data = processData(rawData, name);
    this.xScale = d3.scaleBand()
    .domain(this.xDomain)
    .range([0, this.innerWidth]);

    this.axisYScale = d3.scaleBand()
      .domain(['low', 'high'])
      .range([this.innerHeight, 0])
      .padding(-50)

    this.slotBetweenAttr = 5;
    this.barTotalWidth = this.innerWidth / this.xDomain.length - this.slotBetweenAttr;

    this.xzScale = d3.scaleBand()
      .range([0, this.barTotalWidth])

    this.zScale = d3.scaleOrdinal()
      .range(d3.schemeTableau10)
        
    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.xAxisAppend();

    this.yAxisG = this.g.append('g')
      .call(d3.axisLeft(this.axisYScale))

    this.nameList = [];
    this.barData = [];
    this.bar = this.g;
    this.legend = this.g
  }

  xAxisAppend() {
    this.xAxisG = this.g.append('g')
      .call(d3.axisBottom(this.xScale))
      .attr('transform', `translate(0,${this.innerHeight})`);
    if(this.xDomain != barCategory){
      this.xAxisG.selectAll('text')
        .html(d => this.description[d].replace(/\(/g, ',(').split(',').map((s, i) =>`<tspan x="0" y="${16 + i*16}">${s}</tspan>`))
        // .text(d => d)
        // .text(d => this.description[d])

        // .attr('transform', 'rotate(30)')
    }
    this.xAxisG.selectAll('text')
      .on('click', (_, d) => this.changeMode(d))
  }

  changeMode(cate) {
    if(cate && barCategory.includes(cate)){
      this.xDomain = categoryAttribute[cate];
      this.yScale = this.allAttrScale;
    }
    else{
      this.xDomain = barCategory;
      this.yScale = this.categoryScale;
    }
    this.xScale.domain(this.xDomain);
    this.xAxisG.remove();
    this.xAxisAppend();
    this.barTotalWidth = this.innerWidth / this.xDomain.length - this.slotBetweenAttr;
    this.xzScale.range([0, this.barTotalWidth]);
    this.barData = this.nameList.reduce((p, c) => {
      p.push(...processData(this.rawData, c, this.xDomain))
      return p;
    }, []) 
    this.bar.selectAll('rect').remove();
    this.updateBar();
  }

  show() {
    this.div.style('display', null);
  }

  hide() {
    this.div.style('display', 'none');
  }

  cityRankingShow(name) {
    var nameIdx;
    for(nameIdx = 0; nameIdx < this.rawData.length; nameIdx++){
      if(this.rawData[nameIdx].city == name)
        break;
    }
    if(nameIdx == this.rawData.length)
      return;

    var rankingData = barCategory.map(cate => [cate, this.categoryRanking[cate][nameIdx]]);
    console.log(rankingData);
    
    this.rankingDiv.selectAll('h3').data([name])
      .join('h3')
      .text(d => d);

    this.rankingDiv.selectAll('p')
      .data(rankingData)
      .join('p')
      .text(d => `${d[0]}: ${d[1]} / ${this.rawData.length}`)

  }

  addCity(name) {
    // }
    // if(nameIdx != this.rawData.length)
    //   console.log(nameIdx)
    // barCategory.forEach(cate => {console.log(cate, this.categoryRanking[cate][nameIdx])})
    // var addNames = names.filter(name => !this.nameList.includes(name))
    this.cityRankingShow(name);
    if(this.nameList.includes(name))
      return;
    this.nameList.push(name);
    this.barData.push(...processData(this.rawData, name, this.xDomain));
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
        .attr('y', d => this.yScale[d.attr](d.value))
        .attr('width', this.xzScale.bandwidth())
        .attr('height', d => this.yScale[d.attr](this.yScale[d.attr].domain()[0]) - this.yScale[d.attr](d.value))
        .attr('fill', d => this.zScale(d.name))
    this.legend.selectAll('text.bar-legend').data(this.nameList)
      .join('text')
      .attr('class', 'bar-legend')
      .attr('fill', d => this.zScale(d))
      .attr('x', -120)
      .attr('y', (_, i) => 30*i)
      .style('cursor', 'pointer')
      .text(d => d)
      .on('click', (_, d) => { this.deleteCity(d); })

  }
}

export const processData = (data, name, attrs=barCategory) => { 
  var row = data.filter(d => name == d.city);
  if(row.length == 0)
    // return new Array(55).fill(0).map(() => new Array(55).fill(0));
    return attrs.map(attr => ({name, attr}));
  
    // .reduce((prev, curr) => {
      if(attrs === barCategory){
        return Object.entries(categoryAttribute).map(([k, v]) => ({
            name,
            attr: k,
            value: v.reduce((vPrev, vCurr) => vPrev + +row[0][vCurr], 0)
          }));
      }
      else {
        return attrs.map(attr => ({
            name,
            attr,
            value: row[0][attr]
          }));
      }
      // return prev;
    // }, []);
  }
