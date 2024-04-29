document.getElementById("login_form").addEventListener("submit",
function (event) {
	event.preventDefault();

	let formData = new FormData(this);
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "assets/includes/login.inc.php", true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			document.getElementById("result").innerHTML = xhr.responseText;
		}
	};
	xhr.send(formData);
});