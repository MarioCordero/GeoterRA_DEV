<?php

declare(strict_types=1);

function input_empty(string $username, string $password)
{
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
