<?php

declare(strict_types=1);

// Function that checks if the credentials given are empty
function input_empty(string $username, string $password)
{
  // Uses a php function to check if the variables are empty
  // Returns true if they are empty
  if (empty($username) || empty($password)) {
    return true; 
  }
  else {
    return false;
  } 
}

function is_username_valid(object $pdo, string $username)
{
  if (get_user($pdo, $username)) { 
    return true; 
  }
  else {
    return false;
  } 
}

function is_pass_valid(object $pdo, string $username)
{
  if(get_pass($pdo, $username))
  {
    return true; 
  }
  else {
    return false;
  } 
}
?>
