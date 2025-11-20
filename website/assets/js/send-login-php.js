function credentialError() {
    // Código para manejar errores de credenciales, por ejemplo:
    document.getElementById("credential-error-container").classList.toggle('active');
}

document.getElementById("close-error-msg").onclick = function() {
    document.getElementById("credential-error-container").classList.remove('active');
    document.querySelector('input[name="email"]').value = "";
    document.querySelector('input[name="password"]').value = "";
};

document.getElementById("login_form").addEventListener("submit", function (event) {
  event.preventDefault();
  let formData = new FormData(this);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "../../API/login.inc.php", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try{
        let response = JSON.parse(xhr.responseText);
        if (response.status === 'logged_in') {

          window.location.href = "logged.php";
          // Llama a la función de verificación de sesión después de un inicio de sesión exitoso
          checkSession();

        } else {
          // console.error('Server error:', xhr.responseText);
          credentialError()
        }
      }
      catch {
        // console.log(xhr.responseText)
      }
    }
  };
  xhr.send(formData);
});
