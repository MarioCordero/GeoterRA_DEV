//Apenas cargue la pagina
window.onload = function() {

    setTimeout(function () {
        document.getElementById("loader").style.width='0%';
    }, 950)

    setTimeout(function () {
        document.getElementById("loader").style.opacity='0';
    }, 900)

    setTimeout(function () {
        document.getElementById("loader").style.display='none';
    }, 1700)

}