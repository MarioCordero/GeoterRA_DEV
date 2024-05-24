// Falta documentar pero es un cookie 
let cookie = decodeURIComponent(document.cookie);

let splittedCookie = cookie.split(';');
let pointObject = JSON.parse(splittedCookie[0].substring(12));

console.log(pointObject.id + pointObject.coord_x + pointObject.coord_y);
const myElement = document.getElementById('resultChanged');
myElement.textContent = pointObject.id + " " + pointObject.coord_x + " " + pointObject.coord_y;
console.log("Event happened");
document.cookie = 'pointObject=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

