document.addEventListener('DOMContentLoaded', function() {
    // Obtener la dirección de correo electrónico del almacenamiento local
    let email = localStorage.getItem('userEmail');

    function loadUserInfo() {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "../../API/user_info.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                console.log("Información del usuario:", response);

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

    // Función para manejar la carga de solicitudes
    function loadRequests() {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "../../API/get_request.inc.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                console.log("Solicitudes:", response);

                // Seleccionar el contenedor donde se mostrarán las solicitudes
                let requestsContainer = document.getElementById('requests-container');
                requestsContainer.innerHTML = ''; // Limpiar contenedor antes de llenarlo

                // Verificar si la respuesta es un array de solicitudes
                if (Array.isArray(response)) {
                    response.forEach(request => {
                        let requestElement = document.createElement('div');
                        requestElement.className = 'request-item';
                        requestElement.textContent = request; // Ajustar según la estructura de tu JSON
                        requestsContainer.appendChild(requestElement);
                    });
                } else {
                    let errorElement = document.createElement('div');
                    errorElement.className = 'error-message';
                    errorElement.textContent = 'No se encontraron solicitudes.';
                    requestsContainer.appendChild(errorElement);
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

// document.getElementById("close-error-msg").onclick = function() {
//     document.getElementById("credential-error-container").classList.remove('active');
//     document.querySelector('input[name="email"]').value = "";
//     document.querySelector('input[name="password"]').value = "";
// };

// document.addEventListener('DOMContentLoaded', function() {
//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", "../../API/get_request.inc.php", true);
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState == 4 && xhr.status == 200) {

//             let response = JSON.parse(xhr.responseText);
//             console.log(response)

//             // Populate the div with the requests
//             // response.forEach(request => {
//             //     let requestElement = document.createElement('div');
//             //     requestElement.textContent = request; // Adjust based on your JSON structure
//             //     requestsContainer.appendChild(requestElement);
//             // });
//         }
//     };
//     let formData = new FormData();
//     formData.append('email', localStorage.getItem('userEmail'));
//     xhr.send(formData);
// });