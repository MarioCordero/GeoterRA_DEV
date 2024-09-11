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