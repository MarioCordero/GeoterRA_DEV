document.getElementById("add-point-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let formData = new FormData(this);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../../API/request.inc.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {

            let response = JSON.parse(xhr.responseText);
            const modal = document.getElementById('modal');
            const overlay = document.getElementById('overlay');
            const modalMessage = document.getElementById('modal-message'); // Target the message element
            const modalIcon = document.getElementById('modal-icon'); // Target the icon element

            if (response.status === 'request_created') {

              // Show success message
              modalMessage.textContent = 'Request created successfully!';

              // Inject success icon (use any image path or icon class)
              modalIcon.innerHTML = '<div class="icon">';

              openModal(modal, overlay);

            }else {
                // Inject errors into the modal
                let errorObject = response.errors;
                let errorMessages = '';

                // Clear any previous icon
                modalIcon.innerHTML = '';

                // If the response contains multiple errors, loop through them
                if (Array.isArray(errorObject)) {
                    errorObject.forEach(error => {
                        errorMessages += `<p>${error}</p>`;
                    });
                } else {
                    // In case there's a single error
                    errorMessages = `<p>${errorObject}</p>`;
                }

                // Inject the error messages into the modal
                modalMessage.innerHTML = errorMessages; // Use innerHTML for multiple errors
                openModal(modal, overlay);
            }
        }
    };
    xhr.send(formData);
});