export const switchPage = country => {
  d3.select('.detail').style('display', null)
  d3.select('.show-selected')
    .selectAll('h2').data([country])
    .join('h2').text(d => `Selected Country: ${d}`);
}