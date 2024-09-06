document.addEventListener('DOMContentLoaded', function() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../../API/get_request.inc.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {

            let response = JSON.parse(xhr.responseText);
            console.log(response)

            // Populate the div with the requests
            // response.forEach(request => {
            //     let requestElement = document.createElement('div');
            //     requestElement.textContent = request; // Adjust based on your JSON structure
            //     requestsContainer.appendChild(requestElement);
            // });
        }
    };
    let formData = new FormData();
    formData.append('email', localStorage.getItem('userEmail'));
    xhr.send(formData);
});
