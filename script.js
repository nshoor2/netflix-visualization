let currentScene = 0;
const width = 1100;
const height = 600;
let data;

d3.csv("data/cleaned_netflix.csv").then(dataset => {
  data = dataset;
  showScene(currentScene);
});

d3.select("#next").on("click", () => {
  if (currentScene < scenes.length - 1) {
    currentScene++;
    showScene(currentScene);
  }
});

d3.select("#prev").on("click", () => {
  if (currentScene > 0) {
    currentScene--;
    showScene(currentScene);
  }
});

function showScene(sceneIndex) {
  // Clear previous content
d3.select("#scene-container").html("");

//  Add scene number label
d3.select("#scene-container")
  .append("p")
  .attr("id", "scene-label")
  .style("text-align", "center")
  .style("font-weight", "bold")
  .style("font-size", "14px")
  .style("margin-bottom", "6px")
  .style("color", "#444")
  .text(`Scene ${sceneIndex + 1} of ${scenes.length}`);


  const svg = d3.select("#scene-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  scenes[sceneIndex](svg, data);

}

// -------------------- SCENE 1 --------------------
function scene1(svg, data) {
  const countByYear = d3.rollup(data, v => v.length, d => d.release_year);
  const years = Array.from(countByYear.keys()).sort((a, b) => a - b);
  const counts = years.map(y => countByYear.get(y));

  const x = d3.scaleBand()
    .domain(years)
    .range([60, width - 20])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(counts)])
    .range([height - 60, 40]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - 60})`)
    .call(d3.axisBottom(x).tickValues(years.filter(y => y % 2 === 0)))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(60, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Release Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Titles");

  // Chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Netflix Titles Released Per Year");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.selectAll(".bar")
    .data(years)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d))
    .attr("y", d => y(countByYear.get(d)))
    .attr("width", x.bandwidth())
    .attr("height", d => height - 60 - y(countByYear.get(d)))
    .attr("fill", "#5dade2")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`${d}: ${countByYear.get(d)} titles`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

  // Insight box
  svg.append("rect")
    .attr("x", width - 380)
    .attr("y", 40)
    .attr("width", 300)
    .attr("height", 60)
    .attr("fill", "#fffde7")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("rx", 8);

  svg.append("text")
    .attr("x", width - 370)
    .attr("y", 60)
    .attr("font-size", "13px")
    .attr("fill", "#333")
    .style("font-weight", "bold")
    .text("Insight:");

  svg.append("text")
    .attr("x", width - 370)
    .attr("y", 78)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text("2018 had the highest number");

  svg.append("text")
    .attr("x", width - 370)
    .attr("y", 92)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text("of Netflix releases.");

  // Intro text moved below the chart
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-style", "italic")
    .text("This visualization explores how Netflix’s content has evolved globally over time.");


}

// -------------------- SCENE 2 --------------------
function scene2(svg, data) {
  const counts = d3.rollup(data, v => v.length, d => d.type);
  const entries = Array.from(counts.entries());

  const radius = Math.min(width, height) / 2 - 50;
  const color = d3.scaleOrdinal()
    .domain(entries.map(d => d[0]))
    .range(["#5dade2", "#f5e4cb"]); // blue and beige

  const pie = d3.pie().value(d => d[1]);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const arcs = g.selectAll("path")
    .data(pie(entries))
    .enter()
    .append("g");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data[0]))
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`${d.data[0]}: ${d.data[1]} titles`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

  arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("font-size", "12px")
    .style("fill", "black")
    .text(d => `${d.data[0]} (${d.data[1]})`);

  // Annotation box
  svg.append("rect")
    .attr("x", width - 380)
    .attr("y", 40)
    .attr("width", 300)
    .attr("height", 60)
    .attr("fill", "#fffde7")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("rx", 8);

  svg.append("text")
    .attr("x", width - 370)
    .attr("y", 60)
    .attr("font-size", "13px")
    .attr("fill", "#333")
    .style("font-weight", "bold")
    .text("Insight:");

  svg.append("text")
    .attr("x", width - 370)
    .attr("y", 78)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text("Movies account for nearly 70%");

  svg.append("text")
    .attr("x", width - 370)
    .attr("y", 92)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text("of all Netflix titles.");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Content Breakdown: Movies vs. TV Shows");


    // Legend box
const legendData = [
  { label: "Movies", color: "#5dade2" },
  { label: "TV Shows", color: "#f5e4cc" }
];

const legend = svg.append("g")
  .attr("transform", `translate(${width - 180}, 100)`); // Adjust position as needed

legend.selectAll("rect")
  .data(legendData)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d, i) => i * 25)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", d => d.color);

legend.selectAll("text")
  .data(legendData)
  .enter()
  .append("text")
  .attr("x", 25)
  .attr("y", (d, i) => i * 25 + 13)
  .text(d => d.label)
  .attr("font-size", "13px")
  .attr("fill", "#333");

}

// -------------------- SCENE 3 --------------------
function scene3(svg, data) {
  const counts = d3.rollup(data, v => v.length, d => d.country);
  const sorted = Array.from(counts.entries())
    .filter(d => d[0] !== "")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const x = d3.scaleBand()
    .domain(sorted.map(d => d[0]))
    .range([60, width - 20])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(sorted, d => d[1])])
    .range([height - 60, 40]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - 60})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(60, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Country");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Titles");

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.selectAll(".bar")
    .data(sorted)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - 60 - y(d[1]))
    .attr("fill", "#5dade2")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`${d[0]}: ${d[1]} titles`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Top 10 Countries by Number of Netflix Titles");

  // Annotation box near US/India
  svg.append("rect")
    .attr("x", 100)
    .attr("y", 60)
    .attr("width", 300)
    .attr("height", 60)
    .attr("fill", "#fffde7")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("rx", 8);

  svg.append("text")
    .attr("x", 110)
    .attr("y", 80)
    .attr("font-size", "13px")
    .attr("fill", "#333")
    .style("font-weight", "bold")
    .text("Insight:");

  svg.append("text")
    .attr("x", 110)
    .attr("y", 98)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text("The US and India dominate");

  svg.append("text")
    .attr("x", 110)
    .attr("y", 112)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text("Netflix’s content production.");

}

const scenes = [scene1, scene2, scene3];
