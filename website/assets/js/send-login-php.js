// NEW

document.getElementById("login_form").addEventListener("submit", function (event) {
    event.preventDefault();
    let formData = new FormData(this);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../../API/login.inc.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {

            let response = JSON.parse(xhr.responseText);
            if (response.status === 'logged_in') {
                
                window.location.href = "logged.html";
                // Llama a la función de verificación de sesión después de un inicio de sesión exitoso
                checkSession();

            } else {
                let errorObject = response.errors;
                document.getElementById("result").innerHTML = "";
                console.log(errorObject);
                Object.keys(errorObject).forEach(key => {
                    let value = errorObject[key];
                    document.getElementById("result").innerHTML += value + "<br>";
                });
            }

        }
    };
    xhr.send(formData);
});


// OLD
// document.getElementById("login_form").addEventListener("submit",function (event) {

// 	event.preventDefault();
// 	let formData = new FormData(this);
// 	let xhr = new XMLHttpRequest();
// 	xhr.open("POST", "assets/includes/login.inc.php", true);
// 	xhr.onreadystatechange = function () {

//         if (xhr.readyState == 4 && xhr.status == 200) {
            
//             let errorObject = JSON.parse(xhr.responseText);
//             if (errorObject.length === 0) {

//                 window.location.href = "logged.html";

//             } else {

//                 document.getElementById("result").innerHTML = "";
//                 console.log(errorObject);
//                 Object.keys(errorObject).forEach(key => {
//                     let value = errorObject[key];
//                     document.getElementById("result").innerHTML += value + "<br>";
//                 });

//             }
//         }
// 	};
// 	xhr.send(formData);
// });
