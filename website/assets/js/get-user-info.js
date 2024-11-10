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
                    // Store the initial values for later comparison
                    localStorage.setItem( 'initialuserName' , response.name );
                    localStorage.setItem( 'initialEmail' , response.email );
                    localStorage.setItem( 'initialPhone' , response.phone );

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

    function displayUserRequests(requests) {
        let listContainer = document.querySelector('.user-requests ul');
        listContainer.innerHTML = ''; // Clear the list before adding new entries
    
        requests.forEach(request => {
            let listItem = document.createElement('li');
            listItem.innerHTML = `
                <p>ID Punto: ${request.id_soli}</p>
                <div>
                    <a href="#" class="edit-icon"><img src="./assets/images/icons/ojo.png" alt="Edit"></a>
                    <div class="linea-vertical-IDpunto"></div>
                    <a href="#" class="delete-icon"><img src="./assets/images/icons/eliminar.png" alt="Delete"></a>
                </div>
            `;
            listContainer.appendChild(listItem);
    
            // Add event listener for the edit (eye) icon
            listItem.querySelector('.edit-icon').addEventListener('click', function(event) {
                event.preventDefault();
                editRequest(request.id_soli);
            });
    
            // Add event listener for the delete (trash) icon
            listItem.querySelector('.delete-icon').addEventListener('click', function(event) {
                event.preventDefault();
                deleteRequest(request.id_soli);
            });
        });
    }
    
    // Function to handle editing a request
    function editRequest(id) {
        // Redirect to an edit page or open a modal with request details for editing
        window.location.href = `edit-request.html?id=${id}`;
        // Alternatively, you can open a modal or fetch more info and populate an edit form
    }
    
    // Function to handle deleting a request
    function deleteRequest(id) {
        if (confirm("Are you sure you want to delete this request?")) {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "../../API/delete_request.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
                    if (response.status === "delete_success") {
                        alert("Request deleted successfully.");
                        // TODO: BORRAR PUNTO DE LA BASE DE DATOS
                        loadRequests(); // Refresh the list after deletion
                    } else {
                        alert("Failed to delete request.");
                    }
                }
            };
            xhr.send(`id=${id}`);
        }
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
                    console.log(response);
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