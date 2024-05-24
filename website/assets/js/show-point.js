// Falta documentar pero es un cookie 
let cookie = decodeURIComponent(document.cookie);

let splittedCookie = cookie.split(';');
let pointObject = JSON.parse(splittedCookie[0].substring(12));

console.log(pointObject.id + pointObject.coord_x + pointObject.coord_y);
const myElement = document.getElementById('resultChanged');
myElement.textContent = pointObject.id + " " + pointObject.coord_x + " " + pointObject.coord_y;
console.log("Event happened");
document.cookie = 'pointObject=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

uniqueGroups = ["15JSP09", "15JSP11", "15JSP1", "15JSP2", "15JSP4", "15JSP6",
  "15JSP7", "15JSP", "15SP01", "15SP02", "15SP03", "15SP04", "15SP05",
  "15SP06"]

ColorGroups = [ {Group: "15JSP09", color: "#113E66", shape: "circle"}
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

