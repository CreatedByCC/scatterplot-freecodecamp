import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

function drawGraph(dataset) {
  //console.log(dataset[0]['Year']);
  // dimensions
  const width = 800;
  const height = 500;
  const padding = 60;
  
  const color = d3.scaleOrdinal(d3.schemeCategory10);
    
  const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

  // scales
  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, (d) => d['Year']), d3.max(dataset, (d) => d['Year'])])
    .range([padding, width - padding]);

  const yScale = d3.scaleTime()
    .domain([d3.min(dataset, (d) => new Date(d['Seconds'] * 1000)), d3.max(dataset, (d) => new Date(d['Seconds'] * 1000))])   // multiply with 1000 to change to milliseconds
    .range([padding, height - padding]);  //descending time scale
  
  // tooltip
  const tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);
  
  // plots
  svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr('class', 'dot')
    .attr("cx", (d) => xScale(d['Year']))
    .attr("cy", (d) => yScale(new Date(d['Seconds'] * 1000)))
    .attr('data-xvalue', (d) => d['Year'])
    .attr('data-yvalue', (d) => new Date(d['Seconds'] * 1000))
    .attr("r", 5)
    .attr('fill', (d) => color(d['Doping'] !==  ''))
    .on('mouseover', (e, d) => {
      tooltip.transition().style('opacity', 0.9);
      tooltip.attr('data-year', d['Year']);
      tooltip.html(`${d['Name']}: ${d['Nationality']} <br/>
        Year: ${d['Year']}, Time: ${d['Time']} 
        ${d['Doping'] ? '<br><br>' + d['Doping'] : ''}`)
        .style('left', `${e.pageX}px`)
        .style('top', `${e.pageY - 28}px`);
  })
    .on('mouseout', (d) => {
      tooltip.transition().style('opacity', 0);
  }); 

  // axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

  svg.append("g")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis)
    .attr('id', 'x-axis');

  svg.append("g")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis)
    .attr('id', 'y-axis');
  
  // legend
  const legendGroup = svg.append('g').attr('id', 'legend')
  
  const legendEntry = legendGroup.selectAll('#legend')
    .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-label')
      .attr('transform', (d, i) => `translate(0, ${(padding * 2) - (i * 20)})`);

  legendEntry.append('circle')
    .attr('fill', color)
    .attr('cx', width - 100)
    .attr('cy', 10)
    .attr('r', 8);

  legendEntry.append('text')
      .attr('x', width - 112)
      .attr('y', 10)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text((d) => {
        if (d) {
          return 'Riders with doping allegations';
        } else {
          return 'No doping allegations';
        }
  });
  
  // y-axis header
  svg.append('text')    
    .attr('transform', 'rotate(-90)')
    .attr('x', -190)
    .attr('y', 13)
    .text('Time in Minutes')
    .style('font-size', '1rem');
    
};

async function getData() {
  const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json");
  const data = await response.json();
  //console.log(data[0]["Year"]);
  drawGraph(data);
};

getData();