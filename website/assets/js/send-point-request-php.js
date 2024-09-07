// NEW

document.getElementById("add-point-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let formData = new FormData(this);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../../API/request.inc.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText)
            let response = JSON.parse(xhr.responseText);
            console.log(response)
            if (response.status === 'request_created') {
              const modal = document.getElementById('modal');
              const overlay = document.getElementById('overlay');
              openModal(modal, overlay);          
            }
            else {
                let errorObject = response.errors;
                console.log(errorObject);
            }
        }
    };
    xhr.send(formData);
});

// Hacer una solicitud para obtener los puntos desde la base de datos
function fetchUserRequests() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../../API/fetch_requests.inc.php", true); // Ajusta la URL y método según tu API
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.status === 'success') {
                displayUserRequests(response.data); // Llamar a la función para mostrar las solicitudes
            } else {
                console.error("Error al obtener las solicitudes:", response.message);
            }
        }
    };
    xhr.send();
}

// Función para mostrar las solicitudes en la lista
function displayUserRequests(requests) {
    let listContainer = document.querySelector('.user-requests ul');
    listContainer.innerHTML = ''; // Limpiar la lista antes de agregar nuevas entradas

    requests.forEach(request => {
        let listItem = document.createElement('li');
        listItem.innerHTML = `
            <p>ID Punto: ${request.id}</p>
            <div>
                <a href=""><img src="./assets/images/icons/ojo.png" alt=""></a>
                <div class="linea-vertical-IDpunto"></div>
                <a href=""><img src="./assets/images/icons/eliminar.png" alt=""></a>
            </div>
        `;
        listContainer.appendChild(listItem);
    });
}

// Llamar a la función para cargar las solicitudes cuando se cargue la página
document.addEventListener('DOMContentLoaded', function () {
    fetchUserRequests();
});