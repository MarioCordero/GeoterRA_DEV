document.addEventListener('DOMContentLoaded', function() {
    // Obtener la dirección de correo electrónico del almacenamiento local
    let email = localStorage.getItem('userEmail');

    function loadUserInfo() {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "../../API/user_info.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {

                let response = JSON.parse(xhr.responseText);

                // Seleccionar los elementos donde se mostrará la información del usuario
                let userNameElement = document.getElementById('user-name');
                let userEmailElement = document.getElementById('user-email');
                let userPhoneElement = document.getElementById('user-phone');
                
                // Verificar si la respuesta contiene la información del usuario
                if (response && response.name && response.email) {
                    userNameElement.textContent = response.name; // Ajustar según la estructura de tu JSON
                    userEmailElement.textContent = response.email;
                    // Suponiendo que 'response.phone' contiene el número de teléfono
                    if (response.phone) {
                        userPhoneElement.textContent = response.phone;
                    }
                    document.getElementById('tittle-page').textContent = response.name; // Update the title
                } else {
                    userNameElement.textContent = 'No se encontró la información del usuario.';
                    userEmailElement.textContent = 'No se encontró la información del usuario.';
                    userPhoneElement.textContent = 'No se encontró la información del usuario.';
                }
            }
        };
        let formData = new FormData();
        formData.append('email', email);
        xhr.send(formData);
    }

    // Función para mostrar las solicitudes en la lista
    function displayUserRequests(requests) {
        let listContainer = document.querySelector('.user-requests ul');
        listContainer.innerHTML = ''; // Limpiar la lista antes de agregar nuevas entradas

        requests.forEach(request => {
            let listItem = document.createElement('li');
            listItem.innerHTML = `
                <p>ID Punto: ${request.id_soli}</p>
                <div>
                    <a href=""><img src="./assets/images/icons/ojo.png" alt=""></a>
                    <div class="linea-vertical-IDpunto"></div>
                    <a href=""><img src="./assets/images/icons/eliminar.png" alt=""></a>
                </div>
            `;
            listContainer.appendChild(listItem);
        });
    }

    // Función para manejar la carga de solicitudes
    function loadRequests() {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "../../API/get_request.inc.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);

                // Verificar si la respuesta contiene las solicitudes dentro del objeto
                if (response.status === 'response_succeded' && Array.isArray(response['solicitudes mostras'])) {
                    // Llamar a la función auxiliar para mostrar las solicitudes
                    displayUserRequests(response['solicitudes mostras']);
                } else {
                    console.log("Error: no hay solicitudes");
                }
            }
        };
        let formData = new FormData();
        formData.append('email', email);
        xhr.send(formData);
    }

    // Llamar a las funciones para cargar la información del usuario y las solicitudes
    loadUserInfo();
    loadRequests();

});
