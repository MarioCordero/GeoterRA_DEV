<?php

function insert_request(object $pdo, array $request_fields)
{
  // Revisa que la insercion se haya realizado correctamente
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
  // Convierte los campos que requieran un formato especifico
  convert_fields($request_fields, $errors);

  // Revisa que los campos rellenados sean validos
  validate_fields($request_fields, $errors); 

  // Si ha ocurrido un error a lo largo de la revision retorna falso
  if($errors) 
  {
    return false;
  }

  // Revisa que los campos vacios que si pueden estarlo, se llenen
  if (empty($request_fields['propietario']))
  {
    $request_fields['propietario'] = 'NoInfo';
  }
  if (empty($request_fields['uso_actual']))
  {
    $request_fields['uso_actual'] = 'NoInfo';
  }

  return true;
}

function validate_fields($request_fields, &$errors) {
  // Revisa si el nombre del punto esta vacio
  if(empty($request_fields['point_id']))
  {
    $errors[] = ['type' => 'empty_field', 'message' => 'Nose indico un nombre para el punto de solicitud.'];
  }

  // Revisa que el numero de telefono no este vacio y que sea valido
  if(!empty($request_fields['num_telefono'])) 
  {
    if (!preg_match("/^\d{8}$/", $request_fields["num_telefono"])) {
      $errors[] = ['type' => 'invalid_field', 'message' => 'Formato de numero telefonico invalido.'];
    }
  } 
  else
  {
    $errors[] = ['type' => 'empty_field', 'message' => 'No se brindo un numero de contacto.'];
  }

  // Revisa si la direccion esta vacia
  if(empty($request_fields['direccion'])) 
  {
    $errors[] = ['type' => 'empty_field', 'message' => 'No se brindaron datos de direccion adicionales.'];
  }
}

function convert_fields(array &$request_fields, array &$errors) {
  // Revisa el formato del burbujeo
  if($request_fields['burbujeo'] == '1')
  {
    $request_fields['burbujeo'] = 1;
  }
  elseif($request_fields['burbujeo'] == '0') 
  {
    $request_fields['burbujeo'] = 0;
  }
  else 
  {
    $errors[] = ['type' => 'invalid_field', 'message' => 'Valor de  burbujeo invalido.'];
  }

  // Revisa que la fecha brindada pueda ser formateada para mysql
  if(strtotime($request_fields['fecha']))
  { 
    $timestamp = strtotime($request_fields['fecha']);
    $request_fields['fecha'] = date('Y-m-d', $timestamp);
  }
  else 
  { echo $request_fields['fecha'];
    $errors[] = ['type' => 'invalid_field', 'message' => 'Fecha proporcionada con mal formato.'];
  }

  // if (!empty($request_fields['gps']))
  // {
  //   // Espera coordenadas con el formato: 32.090909, 32,9009090 en el campo gps
  //   $string = $request_fields['gps'];
  //   $delimiter = ",";
  //   $splitted = explode($string, $delimiter);

  //   $request_fields['coord_x'] = $splitted[0];
  //   $request_fields['coord_y'] = substr($splitted[1],1);
  // }
}


?>
