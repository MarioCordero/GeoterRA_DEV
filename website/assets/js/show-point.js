// Falta documentar pero es un cookie 
let splittedCookie = cookie.split(';');
let cookie = decodeURIComponent(document.cookie);
let pointObject = JSON.parse(splittedCookie[0].substring(12));

console.log(pointObject.id + pointObject.coord_x + pointObject.coord_y);
const myElement = document.getElementById('resultChanged');
myElement.textContent = pointObject.id + " " + pointObject.coord_x + " " + pointObject.coord_y;
console.log("Event happened");
document.cookie = 'pointObject=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Grafico

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

TriangleFillLines = [
  {x0: 0.30000000000000004, y0: 0.37320508075688774, x1: 1.0999999999999999, y1: 0.37320508075688774}
  , {x0: 0.4, y0: 0.5464101615137755, x1: 1, y1: 0.5464101615137755}
  , {x0: 0.5, y0: 0.7196152422706632, x1: 0.8999999999999999, y1: 0.7196152422706632}
  , {x0: 0.6000000000000001, y0: 0.8928203230275509, x1: 0.7999999999999999, y1: 0.8928203230275509}
  , {x0: 1, y0: 0.2, x1: 0.6, y1: 0.8928203230275509}
  , {x0: 0.7999999999999999, y0: 0.2, x1: 0.49999999999999994, y1: 0.7196152422706632}
  , {x0: 0.6, y0: 0.2, x1: 0.39999999999999997, y1: 0.5464101615137755}
  , {x0: 0.3999999999999999, y0: 0.2, x1: 0.29999999999999993, y1: 0.3732050807568877}
  , {x0: 0.3999999999999999, y0: 0.2, x1: 0.7999999999999999, y1: 0.8928203230275509}
  , {x0: 0.6, y0: 0.2, x1: 0.8999999999999999, y1: 0.7196152422706632}
  , {x0: 0.7999999999999999, y0: 0.2, x1: 1, y1: 0.5464101615137755}
  , {x0: 1, y0: 0.2, x1: 1.1, y1: 0.3732050807568877}
  , {x0: 1.5, y0: 0.37320508075688774, x1: 2.3, y1: 0.37320508075688774}
  , {x0: 1.5999999999999999, y0: 0.5464101615137755, x1: 2.1999999999999997, y1: 0.5464101615137755}
  , {x0: 1.7, y0: 0.7196152422706632, x1: 2.1, y1: 0.7196152422706632}
  , {x0: 1.7999999999999998, y0: 0.8928203230275509, x1: 2, y1: 0.8928203230275509}
  , {x0: 2.1999999999999997, y0: 0.2, x1: 1.7999999999999998, y1: 0.8928203230275509}
  , {x0: 2, y0: 0.2, x1: 1.7, y1: 0.7196152422706632}
  , {x0: 1.7999999999999998, y0: 0.2, x1: 1.5999999999999999, y1: 0.5464101615137755}
  , {x0: 1.5999999999999999, y0: 0.2, x1: 1.5, y1: 0.3732050807568877}
  , {x0: 1.5999999999999999, y0: 0.2, x1: 2, y1: 0.8928203230275509}
  , {x0: 1.7999999999999998, y0: 0.2, x1: 2.1, y1: 0.7196152422706632}
  , {x0: 2, y0: 0.2, x1: 2.1999999999999997, y1: 0.5464101615137755}
  , {x0: 2.2, y0: 0.2, x1: 2.3, y1: 0.3732050807568877}
  , {x0: 1.5, y0: 0.7196152422706632, x1: 1, y1: 1.5856406460551018}
  , {x0: 1.6, y0: 0.8928203230275509, x1: 1.1, y1: 1.7588457268119895}
  , {x0: 1.7000000000000002, y0: 1.0660254037844386, x1: 1.2000000000000002, y1: 1.9320508075688771}
  , {x0: 1.2, y0: 0.5464101615137755, x1: 1.7, y1: 1.4124355652982141}
  , {x0: 1.1, y0: 0.7196152422706632, x1: 1.6, y1: 1.5856406460551018}
  , {x0: 1, y0: 0.8928203230275509, x1: 1.5, y1: 1.7588457268119895}
  , {x0: 0.9, y0: 1.0660254037844386, x1: 1.4, y1: 1.9320508075688771}
]

// function TriangleFillLines() {
//   const Lines = [];
//   //Triangle 1 horizontal lines
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle1XY[0] + breaks[i] / 2,
//       y0: Triangle1XY[1] + (breaks[i] * Math.sqrt(3)) / 2,
//       x1: Triangle1XY[0] + 1 - breaks[i] / 2,
//       y1: Triangle1XY[1] + (breaks[i] * Math.sqrt(3)) / 2
//     });
//   }
//   //Triangle 1 left leaning grids
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle1XY[0] + 1 - breaks[i],
//       y0: Triangle1XY[1],
//       x1: Triangle1XY[0] + 1 / 2 - breaks[i] / 2,
//       y1: Triangle1XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
//     });
//   }
//   //Triangle 1 right leaning grids
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle1XY[0] + 1 - (1 - breaks[i]),
//       y0: Triangle1XY[1],
//       x1: Triangle1XY[0] + 1 / 2 + breaks[i] / 2,
//       y1: Triangle1XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
//     });
//   }
//   //Triangle 2 horizontal lines
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle2XY[0] + breaks[i] / 2,
//       y0: Triangle2XY[1] + (breaks[i] * Math.sqrt(3)) / 2,
//       x1: Triangle2XY[0] + 1 - breaks[i] / 2,
//       y1: Triangle2XY[1] + (breaks[i] * Math.sqrt(3)) / 2
//     });
//   }
//   //Triangle 2 left leaning grids
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle2XY[0] + 1 - breaks[i],
//       y0: Triangle2XY[1],
//       x1: Triangle2XY[0] + 1 / 2 - breaks[i] / 2,
//       y1: Triangle2XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
//     });
//   }
//   //Triangle 2 right leaning grids
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle2XY[0] + 1 - (1 - breaks[i]),
//       y0: Triangle2XY[1],
//       x1: Triangle2XY[0] + 1 / 2 + breaks[i] / 2,
//       y1: Triangle2XY[1] + ((1 - breaks[i]) * Math.sqrt(3)) / 2
//     });
//   }
//   //Rhombus left leaning grids
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle1XY[0] + 1.1 + breaks[i] / 2,
//       y0: Triangle2XY[1] + Math.sqrt(3) * 0.1 + (Math.sqrt(3) / 2) * breaks[i],
//       x1: Triangle1XY[0] + 1.1 - 1 / 2 + breaks[i] / 2,
//       y1:
//         Triangle2XY[1] +
//         Math.sqrt(3) * 0.1 +
//         (Math.sqrt(3) / 2) * breaks[i] +
//         Math.sqrt(3) / 2
//     });
//   }
//   //Rhombus right leaning grids
//   for (let i in breaks) {
//     Lines.push({
//       x0: Triangle1XY[0] + 1.1 - breaks[i] / 2,
//       y0: Triangle2XY[1] + Math.sqrt(3) * 0.1 + (Math.sqrt(3) / 2) * breaks[i],
//       x1: Triangle1XY[0] + 1.1 + 1 / 2 - breaks[i] / 2,
//       y1:
//         Triangle2XY[1] +
//         Math.sqrt(3) * 0.1 +
//         (Math.sqrt(3) / 2) * breaks[i] +
//         Math.sqrt(3) / 2
//     });
//   }
//
//   return Lines;
// }

const width = 800;
const height = 600;
const margin = {top: 20, right: 20, bottom: 20, left: 20};

const svg = d3.select("#piperDiagram")
.attr("width", width)
.attr("height", height);

const g = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().domain([0, 3]).range([0, width - margin.left - margin.right]);
const yScale = d3.scaleLinear().domain([0, 2]).range([height - margin.top - margin.bottom, 0]);

// Draw grid lines
TriangleFillLines.forEach(line => {
  g.append("line")
    .attr("x1", xScale(line.x0))
    .attr("y1", yScale(line.y0))
    .attr("x2", xScale(line.x1))
    .attr("y2", yScale(line.y1))
    .attr("stroke", "lightgrey")
    .attr("stroke-width", 1);
});

// Function to draw a circle or rectangle based on the shape
function drawShape(group, x, y) {
  if (group.shape === "circle") {
    g.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 5)
      .attr("fill", group.color);
  } else if (group.shape === "rectangle") {
    g.append("rect")
      .attr("x", x - 5)
      .attr("y", y - 5)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", group.color);
  }
}

// Example data points (replace with actual data)
const dataPoints = [
  {group: "15JSP09", x: 0.5, y: 0.5},
  {group: "15SP02", x: 1.5, y: 1.5}
];

// Plot data points
dataPoints.forEach(d => {
  const group = ColorGroups.find(g => g.Group === d.group);
  if (group) {
    drawShape(group, xScale(d.x), yScale(d.y));
  }
});

