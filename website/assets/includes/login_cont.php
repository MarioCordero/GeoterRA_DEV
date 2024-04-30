<?php

declare(strict_types=1);

// Function that checks if the credentials given are empty
function input_empty(string $email, string $password)
{
  // Uses a php function to check if the variables are empty
  // Returns true if they are empty
  if (empty($email) || empty($password)) {
    return true; 
  }
  else {
    return false;
  } 
}

function is_email_valid(object $pdo, string $email)
{
  if (get_email($pdo, $email)) { 
    return true; 
  }
  else {
    return false;
  } 
}

function is_pass_valid(object $pdo, string $password)
{
  if(get_pass($pdo, $password))
  {
    return true; 
  }
  else {
    return false;
  } 
}
?>
