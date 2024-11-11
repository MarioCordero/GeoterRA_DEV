$(document).ready(function () {
    checkSession();
});

function checkSession() {
    $.ajax({
        url: '../../API/check_session.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.status === 'logged_in') {

                console.log('User is logged in');
                localStorage.setItem('userEmail', response.user);

                // Cambiar las nav bar si el usuario está logeado o no
                const navBar = document.getElementById('navbar');
                const loggedNavBar = document.getElementById('navbar-logged');

                navBar.classList.toggle('active');
                loggedNavBar.classList.toggle('active');
				
            } else {
                // TODO[] Revisar, se puede mejorar
                // Check the current page
                const currentPage = window.location.pathname;
                
                // If the current page is one of the specified ones, redirect to login
                const restrictedPages = ['/logged.php', '/addpoint.html'];
                if (restrictedPages.includes(currentPage)) {
                    console.log('User is not logged in, redirecting to login page');
                    window.location.href = 'login.php'; // Redirige a la página de inicio de sesión
                } else {
                    console.log('User is not logged in, but no redirection required for this page');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX request failed:', status, error);
        }
    });
}
