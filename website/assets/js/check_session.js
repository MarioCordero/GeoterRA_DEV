$(document).ready(function() {
  $.ajax({
    url: '.assets/includes/check_session.php',
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response.status === 'logged_in') {

        console.log('User is logged in');
        
      } else {
        console.log('User is not logged in');
        window.location.href = 'login.html'; 
      }
    },
    error: function(xhr, status, error) {
      console.error('AJAX request failed:', status, error);
    }
  });
});