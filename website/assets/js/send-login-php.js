document.getElementById("login_form").addEventListener("submit",
function (event) {
	event.preventDefault();

	let formData = new FormData(this);
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "assets/includes/login.inc.php", true);
	xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let errorObject = JSON.parse(xhr.responseText);
        if (errorObject.length === 0) {
          window.location.href = "logged_in.html";
        } else {
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
