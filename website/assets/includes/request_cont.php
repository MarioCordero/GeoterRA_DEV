<?php

function insert_request(object $pdo, array $request_fields)
{
  if(insert_to_sol($pdo, $request_fields))
  {
    return true; 
  }
  else {
    return false;
  } 
}

function check_fields(array &$request_fields, array &$errors)
{
  convert_fields($request_fields);

  return false;
}

function convert_fields(array &$request_fields) {
  if($request_fields['burbujeo'] == '1')
  {
    $request_fields['burbujeo'] = true;
  }
  else 
  {
    $request_fields['burbujeo'] = false;
  }

  $timestamp = strtotime($request_fields['fecha']);
  $request_fields['fecha'] = date('Y-m-d', $timestamp);
}

?>
