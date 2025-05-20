// Obtener el punto desde localStorage y llenar el formulario
let pointStr = localStorage.getItem("pointObject");
let pointObject = JSON.parse(pointStr);

// Asignar los valores al formulario
document.getElementById('point-id').value   = pointObject.id;
document.getElementById('region').value     = pointObject.region;
document.getElementById('coord-x').value    = pointObject.coord_x;
document.getElementById('coord-y').value    = pointObject.coord_y;
document.getElementById('temp').value       = pointObject.temp;
document.getElementById('ph-campo').value   = pointObject.pH_campo;
document.getElementById('cond-campo').value = pointObject.cond_campo;

// Exportar a PDF
document.getElementById('export-pdf').addEventListener('click', function (e) {
    e.preventDefault();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Información del Punto", 10, 10);
    doc.text(`ID: ${pointObject.id}`, 10, 20);
    doc.text(`Región: ${pointObject.region}`, 10, 30);
    doc.text(`Coordenada X: ${pointObject.coord_x}`, 10, 40);
    doc.text(`Coordenada Y: ${pointObject.coord_y}`, 10, 50);
    doc.text(`Temperatura: ${pointObject.temp}`, 10, 60);
    doc.text(`pH (Campo): ${pointObject.pH_campo}`, 10, 70);
    doc.text(`Conductividad (Campo): ${pointObject.cond_campo}`, 10, 80);
    // Añade más campos si es necesario

    doc.save("informacion_punto.pdf");
    window.print();
});


createPiperDiagram()

// Graph 
function createPiperDiagram() {
  const margin = ({ top: 0, right: 0, bottom: 35, left: 0 })
  const width = 600;
  const height = 600;

  let svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  let g = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

let x = d3.scaleLinear().domain([0, 2.4]).range([0, width])
let y = d3.scaleLinear().domain([0, 2.4]).range([height, 0]);

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
      .attr("x1", x(lines[i].x0))
      .attr("y1", y(lines[i].y0))
      .attr("x2", x(lines[i].x1))
      .attr("y2", y(lines[i].y1));
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
      .style("stroke-width", 2)
      .attr("stroke", "black")
      .style("stroke-dasharray", "5,1")
      .attr("x1", x(Triangle[i].x0))
      .attr("y1", y(Triangle[i].y0))
      .attr("x2", x(Triangle[i].x1))
      .attr("y2", y(Triangle[i].y1));
  }

  // Etiquetas de los valores

  TickLabels = [
    {x: 0.385, y: 0.17, text: "80", rot: "0", FontSize: 8}
    ,{x: 0.5850000000000001, y: 0.17, text: "60", rot: "0", FontSize: 8}
    ,{x: 0.785, y: 0.17, text: "40", rot: "0", FontSize: 8}
    ,{x: 0.985, y: 0.17, text: "20", rot: "0", FontSize: 8}
    ,{x: 0.58, y: 0.8828203230275509, text: "80", rot: "-60", FontSize: 8}
    ,{x: 0.4799999999999999, y: 0.7096152422706632, text: "60", rot: "-60", FontSize: 8}
    ,{x: 0.37999999999999995, y: 0.5364101615137755, text: "40", rot: "-60", FontSize: 8}
    ,{x: 0.2799999999999999, y: 0.3632050807568877, text: "20", rot: "-60", FontSize: 8}
    ,{x: 0.8049999999999999, y: 0.9128203230275509, text: "20", rot: "60", FontSize: 8}
    ,{x: 0.9049999999999999, y: 0.7396152422706632, text: "40", rot: "60", FontSize: 8}
    ,{x: 1.005, y: 0.5664101615137755, text: "60", rot: "60", FontSize: 8}
    ,{x: 1.105, y: 0.3932050807568877, text: "80", rot: "60", FontSize: 8}
    ,{x: 1.585, y: 0.17, text: "80", rot: "0", FontSize: 8}
    ,{x: 1.785, y: 0.17, text: "60", rot: "0", FontSize: 8}
    ,{x: 1.985, y: 0.17, text: "40", rot: "0", FontSize: 8}
    ,{x: 2.185, y: 0.17, text: "20", rot: "0", FontSize: 8}
    ,{x: 1.7799999999999998, y: 0.8828203230275509, text: "80", rot: "-60", FontSize: 8}
    ,{x: 1.68, y: 0.7096152422706632, text: "60", rot: "-60", FontSize: 8}
    ,{x: 1.5799999999999998, y: 0.5364101615137755, text: "40", rot: "-60", FontSize: 8}
    ,{x: 1.48, y: 0.3632050807568877, text: "20", rot: "-60", FontSize: 8}
    ,{x: 2.005, y: 0.9128203230275509, text: "20", rot: "60", FontSize: 8}
    ,{x: 2.105, y: 0.7396152422706632, text: "40", rot: "60", FontSize: 8}
    ,{x: 2.2049999999999996, y: 0.5664101615137755, text: "60", rot: "60", FontSize: 8}
    ,{x: 2.3049999999999997, y: 0.3932050807568877, text: "80", rot: "60", FontSize: 8}
    ,{x: 0.882, y: 1.4074355652982142, text: "20", rot: "-60", FontSize: 8}
    ,{x: 0.982, y: 1.580640646055102, text: "40", rot: "-60", FontSize: 8}
    ,{x: 1.082, y: 1.7538457268119896, text: "60", rot: "-60", FontSize: 8}
    ,{x: 1.1820000000000002, y: 1.9270508075688773, text: "80", rot: "-60", FontSize: 8}
    ,{x: 1.7049999999999998, y: 1.4324355652982141, text: "20", rot: "60", FontSize: 8}
    ,{x: 1.605, y: 1.6056406460551018, text: "40", rot: "60", FontSize: 8}
    ,{x: 1.505, y: 1.7788457268119895, text: "60", rot: "60", FontSize: 8}
    ,{x: 1.4049999999999998, y: 1.9520508075688772, text: "80", rot: "60", FontSize: 8}
  ]

  TextPos = [
    {x: 1.6099999999999999, y: 1.6922431864335457, text: "Calcium + Magnesium", rot: "60", FontSize: 18}
    ,{x: 0.9949999999999999, y: 1.6922431864335457, text: "Sulfate + Chloride", rot: "-60", FontSize: 18}
    ,{x: 1, y: 0.6830127018922194, text: "Sodium + Potassium", rot: "60", FontSize: 18}
    ,{x: 1.5999999999999999, y: 0.6830127018922194, text: "Carbonate + Bicarbonate", rot: "-60", FontSize: 18}
    ,{x: 0.41000000000000003, y: 0.6730127018922194, text: "Magnesium", rot: "-60", FontSize: 18}
    ,{x: 2.19, y: 0.6730127018922194, text: "Sulfate", rot: "60", FontSize: 18}
    ,{x: 0.7, y: 0.1, text: "Calcium", rot: "0", FontSize: 18}
    ,{x: 1.9, y: 0.1, text: "Chloride", rot: "0", FontSize: 18}
  ]
for (let i in lines) {
  g.append("line")
    .style("stroke-width", 0.5)
    .attr("stroke", "gray")
    .style("stroke-dasharray", "5,1")
    .attr("x1", x(lines[i].x0))
    .attr("y1", y(lines[i].y0))
    .attr("x2", x(lines[i].x1))
    .attr("y2", y(lines[i].y1));
}
// Triangulo Exterior

  svg.selectAll("text.rotation")
    .data(TextPos.concat(TickLabels))
    .enter()
    .append("text")
    .text((d) => d.text)
    .classed("rotation", true)
    .attr("fill", "black")
    .style("font-size", (d) => d.FontSize)
    .attr("transform", (d, i) => {
      return (
        "translate( " + x(d.x) + " , " + y(d.y) + ")," + "rotate(" + d.rot + ")"
      );
    })
    .attr("x", 0)
    .style("text-anchor", "middle")
    .attr("y", 0);

  const existingSvg = document.getElementById("piperDiagram");

  // dataEq = data.map((x) => {
  //   x.Potassium /= 39.1;
  //   x.Sodium /= 22.9;
  //   x.Bicarbonate /= 61.02;
  //   x.Carbonate /= 30;
  //   x.Calcium /= 20.04;
  //   x.Magnesium /= 12.15;
  //   x.Chloride /= 35.45;
  //   x.Sulfate /= 48.03;
  //   return x;
  // })

  d3.select(existingSvg)
    .append(() => svg.node());
}

for (let i in Triangle) {
  g.append("line")
    .style("stroke-width", 2)
    .attr("stroke", "black")
    .style("stroke-dasharray", "5,1")
    .attr("x1", x(Triangle[i].x0))
    .attr("y1", y(Triangle[i].y0))
    .attr("x2", x(Triangle[i].x1))
    .attr("y2", y(Triangle[i].y1));
}

// Etiquetas de los valores

TickLabels = [
   {x: 0.385, y: 0.17, text: "80", rot: "0", FontSize: 8}
  ,{x: 0.5850000000000001, y: 0.17, text: "60", rot: "0", FontSize: 8}
  ,{x: 0.785, y: 0.17, text: "40", rot: "0", FontSize: 8}
  ,{x: 0.985, y: 0.17, text: "20", rot: "0", FontSize: 8}
  ,{x: 0.58, y: 0.8828203230275509, text: "80", rot: "-60", FontSize: 8}
  ,{x: 0.4799999999999999, y: 0.7096152422706632, text: "60", rot: "-60", FontSize: 8}
  ,{x: 0.37999999999999995, y: 0.5364101615137755, text: "40", rot: "-60", FontSize: 8}
  ,{x: 0.2799999999999999, y: 0.3632050807568877, text: "20", rot: "-60", FontSize: 8}
  ,{x: 0.8049999999999999, y: 0.9128203230275509, text: "20", rot: "60", FontSize: 8}
  ,{x: 0.9049999999999999, y: 0.7396152422706632, text: "40", rot: "60", FontSize: 8}
  ,{x: 1.005, y: 0.5664101615137755, text: "60", rot: "60", FontSize: 8}
  ,{x: 1.105, y: 0.3932050807568877, text: "80", rot: "60", FontSize: 8}
  ,{x: 1.585, y: 0.17, text: "80", rot: "0", FontSize: 8}
  ,{x: 1.785, y: 0.17, text: "60", rot: "0", FontSize: 8}
  ,{x: 1.985, y: 0.17, text: "40", rot: "0", FontSize: 8}
  ,{x: 2.185, y: 0.17, text: "20", rot: "0", FontSize: 8}
  ,{x: 1.7799999999999998, y: 0.8828203230275509, text: "80", rot: "-60", FontSize: 8}
  ,{x: 1.68, y: 0.7096152422706632, text: "60", rot: "-60", FontSize: 8}
  ,{x: 1.5799999999999998, y: 0.5364101615137755, text: "40", rot: "-60", FontSize: 8}
  ,{x: 1.48, y: 0.3632050807568877, text: "20", rot: "-60", FontSize: 8}
  ,{x: 2.005, y: 0.9128203230275509, text: "20", rot: "60", FontSize: 8}
  ,{x: 2.105, y: 0.7396152422706632, text: "40", rot: "60", FontSize: 8}
  ,{x: 2.2049999999999996, y: 0.5664101615137755, text: "60", rot: "60", FontSize: 8}
  ,{x: 2.3049999999999997, y: 0.3932050807568877, text: "80", rot: "60", FontSize: 8}
  ,{x: 0.882, y: 1.4074355652982142, text: "20", rot: "-60", FontSize: 8}
  ,{x: 0.982, y: 1.580640646055102, text: "40", rot: "-60", FontSize: 8}
  ,{x: 1.082, y: 1.7538457268119896, text: "60", rot: "-60", FontSize: 8}
  ,{x: 1.1820000000000002, y: 1.9270508075688773, text: "80", rot: "-60", FontSize: 8}
  ,{x: 1.7049999999999998, y: 1.4324355652982141, text: "20", rot: "60", FontSize: 8}
  ,{x: 1.605, y: 1.6056406460551018, text: "40", rot: "60", FontSize: 8}
  ,{x: 1.505, y: 1.7788457268119895, text: "60", rot: "60", FontSize: 8}
  ,{x: 1.4049999999999998, y: 1.9520508075688772, text: "80", rot: "60", FontSize: 8}
]

TextPos = [
  {x: 1.6099999999999999, y: 1.6922431864335457, text: "Calcium + Magnesium", rot: "60", FontSize: 18}
  ,{x: 0.9949999999999999, y: 1.6922431864335457, text: "Sulfate + Chloride", rot: "-60", FontSize: 18}
  ,{x: 1, y: 0.6830127018922194, text: "Sodium + Potassium", rot: "60", FontSize: 18}
  ,{x: 1.5999999999999999, y: 0.6830127018922194, text: "Carbonate + Bicarbonate", rot: "-60", FontSize: 18}
  ,{x: 0.41000000000000003, y: 0.6730127018922194, text: "Magnesium", rot: "-60", FontSize: 18}
  ,{x: 2.19, y: 0.6730127018922194, text: "Sulfate", rot: "60", FontSize: 18}
  ,{x: 0.7, y: 0.1, text: "Calcium", rot: "0", FontSize: 18}
  ,{x: 1.9, y: 0.1, text: "Chloride", rot: "0", FontSize: 18}
]

svg.selectAll("text.rotation")
    .data(TextPos.concat(TickLabels))
    .enter()
    .append("text")
    .text((d) => d.text)
    .classed("rotation", true)
    .attr("fill", "black")
    .style("font-size", (d) => d.FontSize)
    .attr("transform", (d, i) => {
      return (
        "translate( " + x(d.x) + " , " + y(d.y) + ")," + "rotate(" + d.rot + ")"
      );
    })
    .attr("x", 0)
    .style("text-anchor", "middle")
    .attr("y", 0);

console.log(lines)

const existingSvg = document.getElementById("piperDiagram");

// dataEq = data.map((x) => {
//   x.Potassium /= 39.1;
//   x.Sodium /= 22.9;
//   x.Bicarbonate /= 61.02;
//   x.Carbonate /= 30;
//   x.Calcium /= 20.04;
//   x.Magnesium /= 12.15;
//   x.Chloride /= 35.45;
//   x.Sulfate /= 48.03;
//   return x;
// })

d3.select(existingSvg)
  .append(() => svg.node());