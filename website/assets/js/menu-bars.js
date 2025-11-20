//The bars that displays the menu
let menubars = document.getElementById('checkbox');
//Background
let menubackground = document.getElementById('menu-bars-background');
//The elements inside the menu (hrefs)
let menuelements = document.getElementById('menu-elements');
// Select all elements with this class
let aMenuElements = document.querySelectorAll('.a-menu-element');

menubars.onclick = function(){ //Once clicked the menu bars

    menubackground.classList.toggle('active'); //Shows a dark background
    menuelements.classList.toggle('active'); //Display the menu elements

}

aMenuElements.forEach(element => {
    element.addEventListener('click', function() {
        menubars.checked = false;
        menubackground.classList.toggle('active'); //Shows a dark background
        menuelements.classList.toggle('active'); //Display the menu elements
    });
});
