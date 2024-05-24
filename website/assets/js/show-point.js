// Falta documentar pero es un cookie 
let cookie = decodeURIComponent(document.cookie);
let splittedCookie = cookie.split(';');
let pointObject = JSON.parse(splittedCookie[0].substring(12));

console.log(pointObject.id + pointObject.coord_x + pointObject.coord_y);
const myElement = document.getElementById('resultChanged');
myElement.textContent = pointObject.id + " " + pointObject.coord_x + " " + pointObject.coord_y;

// Grafico

const margin = {top: 20, right: 20, bottom: 20, left: 20};
const width = 800;
const height = 600;

let svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

let g = svg
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

let xScale = d3.scaleLinear().domain([0, 2.4]).range([0, width])
let yScale = d3.scaleLinear().domain([0, 2.4]).range([height, 0]);

xAxis = (g) =>
  g.attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))
yAxis = (g) => g.attr("transform", `translate(${width},0)`).call(d3.axisLeft(y))

let uniqueGroups = ["15JSP09", "15JSP11", "15JSP1", "15JSP2", "15JSP4", "15JSP6",
  "15JSP7", "15JSP", "15SP01", "15SP02", "15SP03", "15SP04", "15SP05",
  "15SP06"]

let ColorGroups = [ {Group: "15JSP09", color: "#113E66", shape: "circle"}
  ,{Group: "15JSP11", color: "#F37320", shape: "circle"}
  ,{Group: "15JSP1", color: "#42AB50", shape: "circle"}
   ,{Group: "15JSP2", color: "#D34627", shape: "circle"}
   ,{Group: "15JSP4", color: "#38B8D5", shape: "circle"}
 ,{Group: "15JSP6", color: "#8c564b", shape: "circle"}
   ,{Group: "15JSP7", color: "#bcbd22", shape: "circle"}
   ,{Group: "15JSP", color: "#9467bd", shape: "circle"}
   ,{Group: "15SP01", color: "#113E66", shape: "rectangle"}
   ,{Group: "15SP02", color: "#F37320", shape: "rectangle"}
   ,{Group: "15SP03", color: "#42AB50", shape: "rectangle"}
   ,{Group: "15SP04", color: "#D34627", shape: "rectangle"}
   ,{Group: "15SP05", color: "#38B8D5", shape: "rectangle"}
   ,{Group: "15SP06", color: "#8c564b", shape: "rectangle"}
]

let breaks = [0.2, 0.4, 0.6, 0.8]
let Triangle1XY = [0.2, 0.2]
let Triangle2XY = [1.4, 0.2]

function TriangleFillLines() {
  const Lines = [];
  //Triangle 1 horizontal lines
  for (let i in breaks) {
    Lines.push({
      x0: Triangle1XY[0] + breaks[i] / 2,
      y0: Triangle1XY[1] + (breaks[i] * Math.sqrt(3)) / 2,
      x1: Triangle1XY[0] + 1 - breaks[i] / 2,
      y1: Triangle1XY[1] + (breaks[i] * Math.sqrt(3)) / 2
    });
  }
  //Triangle 1 left leaning grids
  for (let i in breaks) {
    Lines.push({
      x0: Triangle1XY[0] + 1 - breaks[i],
      y0: Triangle1XY[1],
      x1: Triangle1XY[0] + 1 / 2 - breaks[i] / 2,
      y1: Triangle1XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
    });
  }
  //Triangle 1 right leaning grids
  for (let i in breaks) {
    Lines.push({
      x0: Triangle1XY[0] + 1 - (1 - breaks[i]),
      y0: Triangle1XY[1],
      x1: Triangle1XY[0] + 1 / 2 + breaks[i] / 2,
      y1: Triangle1XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
    });
  }
  //Triangle 2 horizontal lines
  for (let i in breaks) {
    Lines.push({
      x0: Triangle2XY[0] + breaks[i] / 2,
      y0: Triangle2XY[1] + (breaks[i] * Math.sqrt(3)) / 2,
      x1: Triangle2XY[0] + 1 - breaks[i] / 2,
      y1: Triangle2XY[1] + (breaks[i] * Math.sqrt(3)) / 2
    });
  }
  //Triangle 2 left leaning grids
  for (let i in breaks) {
    Lines.push({
      x0: Triangle2XY[0] + 1 - breaks[i],
      y0: Triangle2XY[1],
      x1: Triangle2XY[0] + 1 / 2 - breaks[i] / 2,
      y1: Triangle2XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
    });
  }
  //Triangle 2 right leaning grids
  for (let i in breaks) {
    Lines.push({
      x0: Triangle2XY[0] + 1 - (1 - breaks[i]),
      y0: Triangle2XY[1],
      x1: Triangle2XY[0] + 1 / 2 + breaks[i] / 2,
      y1: Triangle2XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
    });
  }
  //Rhombus left leaning grids
  for (let i in breaks) {
    Lines.push({
      x0: Triangle1XY[0] + 1.1 + breaks[i] / 2,
      y0: Triangle2XY[1] + Math.sqrt(3) * 0.1 + (Math.sqrt(3) / 2) * breaks[i],
      x1: Triangle1XY[0] + 1.1 - 1 / 2 + breaks[i] / 2,
      y1:
        Triangle2XY[1] +
        Math.sqrt(3) * 0.1 +
        (Math.sqrt(3) / 2) * breaks[i] +
        Math.sqrt(3) / 2
    });
  }
  //Rhombus right leaning grids
  for (let i in breaks) {
    Lines.push({
      x0: Triangle1XY[0] + 1.1 - breaks[i] / 2,
      y0: Triangle2XY[1] + Math.sqrt(3) * 0.1 + (Math.sqrt(3) / 2) * breaks[i],
      x1: Triangle1XY[0] + 1.1 + 1 / 2 - breaks[i] / 2,
      y1:
        Triangle2XY[1] +
        Math.sqrt(3) * 0.1 +
        (Math.sqrt(3) / 2) * breaks[i] +
        Math.sqrt(3) / 2
    });
  }

  return Lines;
} 

let lines = TriangleFillLines()

for (let i in lines) {
  g.append("line")
    .style("stroke-width", 0.5)
    .attr("stroke", "gray")
    .style("stroke-dasharray", "5,1")
    .attr("x1", xScale(lines[i].x0))
    .attr("y1", yScale(lines[i].y0))
    .attr("x2", xScale(lines[i].x1))
    .attr("y2", yScale(lines[i].y1));
}
// Triangulo Exterior

Triangle = [
  //Triangle 1
  {
    x0: Triangle1XY[0],
    y0: Triangle1XY[1],
    x1: Triangle1XY[0] + 1,
    y1: Triangle1XY[1]
  },
  {
    x0: Triangle1XY[0] + 1 / 2,
    y0: Triangle1XY[1] + Math.sqrt(3) / 2,
    x1: Triangle1XY[0] + 1,
    y1: Triangle1XY[1]
  },
  {
    x0: Triangle1XY[0] + 1 / 2,
    y0: Triangle1XY[1] + Math.sqrt(3) / 2,
    x1: Triangle1XY[0],
    y1: Triangle1XY[1]
  },
  //Triangle 2
  {
    x0: Triangle2XY[0],
    y0: Triangle2XY[1],
    x1: Triangle2XY[0] + 1,
    y1: Triangle2XY[1]
  },
  {
    x0: Triangle2XY[0] + 1 / 2,
    y0: Triangle2XY[1] + Math.sqrt(3) / 2,
    x1: Triangle2XY[0] + 1,
    y1: Triangle2XY[1]
  },
  {
    x0: Triangle2XY[0] + 1 / 2,
    y0: Triangle2XY[1] + Math.sqrt(3) / 2,
    x1: Triangle2XY[0],
    y1: Triangle2XY[1]
  },
  // Combined
  {
    x0: Triangle1XY[0] + 1.1,
    y0: Triangle2XY[1] + Math.sqrt(3) * 0.1,
    x1: Triangle1XY[0] + 1.1 - 1 / 2,
    y1: Triangle2XY[1] + Math.sqrt(3) * 0.1 + Math.sqrt(3) / 2
  },
  {
    x0: Triangle1XY[0] + 1.1,
    y0: Triangle2XY[1] + Math.sqrt(3) * 0.1,
    x1: Triangle1XY[0] + 1.1 + 1 / 2,
    y1: Triangle2XY[1] + Math.sqrt(3) * 0.1 + Math.sqrt(3) / 2
  },
  {
    x0: Triangle1XY[0] + 1.1,
    y0: Triangle2XY[1] + Math.sqrt(3) * 0.1 + Math.sqrt(3),
    x1: Triangle1XY[0] + 1.1 - 1 / 2,
    y1: Triangle2XY[1] + Math.sqrt(3) * 0.1 + Math.sqrt(3) / 2
  },
  {
    x0: Triangle1XY[0] + 1.1,
    y0: Triangle2XY[1] + Math.sqrt(3) * 0.1 + Math.sqrt(3),
    x1: Triangle1XY[0] + 1.1 + 1 / 2,
    y1: Triangle2XY[1] + Math.sqrt(3) * 0.1 + Math.sqrt(3) / 2
  }
]


for (let i in Triangle) {
  g.append("line")
    .style("stroke-width", 0.5)
    .attr("stroke", "gray")
    .style("stroke-dasharray", "5,1")
    .attr("x1", xScale(Triangle[i].x0))
    .attr("y1", yScale(Triangle[i].y0))
    .attr("x2", xScale(Triangle[i].x1))
    .attr("y2", yScale(Triangle[i].y1));
}

console.log(lines)


const existingSvg = document.getElementById("piperDiagram");

// Set the innerHTML of the existing SVG element to the SVG content
d3.select(existingSvg)
  .append(() => svg.node());

// TriangleFillLines.forEach(line => {
//   g.append("line")
//     .attr("x1", xScale(line.x0))
//     .attr("y1", yScale(line.y0))
//     .attr("x2", xScale(line.x1))
//     .attr("y2", yScale(line.y1))
//     .attr("stroke", "lightgrey")
//     .attr("stroke-width", 1);
// });

// Example data points (replace with actual data)
const dataPoints = [
  {group: "15JSP09", x: 0.5, y: 0.5},
  {group: "15SP02", x: 1.5, y: 1.5}
];




