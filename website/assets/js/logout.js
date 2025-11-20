document.getElementById("logout-btn").addEventListener("click", function() {
    // Realiza una solicitud al servidor para cerrar la sesión
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../API/logout.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
            window.location.href = "login.php";
        }
    };
    xhr.send();
});
