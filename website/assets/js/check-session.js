
// NEW
$(document).ready(function () {
    checkSession();
});

function checkSession() {
    $.ajax({
        url: 'assets/includes/check_session.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.status === 'logged_in') {

                console.log('User is logged in');
                console.log('User email:', response.user);

                // Cambiar las nav bar si el usuario está logeado o no
                const navBar = document.getElementById('navbar');
                const loggedNavBar = document.getElementById('navbar-logged');

                navBar.classList.toggle('active');
                loggedNavBar.classList.toggle('active');
				
            } else {
                console.log('User is not logged in');
                // window.location.href = 'login.html'; // Redirige a la página de inicio de sesión
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX request failed:', status, error);
        }
    });
}

// OLD
// $(document).ready(function () {
// 	$.ajax({
// 		url: 'assets/includes/check_session.php',
// 		type: 'GET',
// 		dataType: 'json',
// 		success: function (response) {
// 			if (response.status === 'logged_in') {

// 				console.log('User is logged in');

// 			} else {

// 				console.log('User is not logged in');
// 				// window.location.href = 'login.html';
				
// 			}
// 		},
// 		error: function (xhr, status, error) {
// 			console.error('AJAX request failed:', status, error);
// 		}
// 	});
// });