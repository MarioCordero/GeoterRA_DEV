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
  if (empty($request_fields['usoActual']))
  {
    $request_fields['usoActual'] = 'NoInfo';
  }

  return true;
}

function validate_fields($request_fields, &$errors) {
  // Revisa si el nombre del punto esta vacio
  if(empty($request_fields['pointId']))
  {
    $errors['pointId'] = 'empty_field';
  }

  // Revisa que el numero de telefono no este vacio y que sea valido
  if(!empty($request_fields['contactNumber'])) 
  {
    if (!preg_match("/^\d{8}$/", $request_fields["contactNumber"])) {
      $errors['contactNumber'] = "invalid_format";
    }
  } 
  else
  {
    $errors['contactNumber'] = 'empty_field';
  }

  // Revisa si la direccion esta vacia
  if(empty($request_fields['direccion'])) 
  {
    $errors['direccion'] = 'empty_field';
  }
}

function convert_fields(array &$request_fields, array &$errors) {
  // Revisa el formato del burbujeo
  if($request_fields['burbujeo'] == '1')
  {
    $request_fields['burbujeo'] = true;
  }
  elseif($request_fields['burbujeo'] == '0') 
  {
    $request_fields['burbujeo'] = false;
  }
  else 
  {
    $errors['burbujeo'] = 'invalid_field';
  }

  // Revisa que la fecha brindada pueda ser formateada para mysql
  if(strtotime($request_fields['fecha']))
  {
    $timestamp = strtotime($request_fields['fecha']);
    $request_fields['fecha'] = date('Y-m-d', $timestamp);
  }
  else 
  {
    $errors['fecha'] = 'invalid_field';
  }

  if (!empty($request_fields['gps']))
  {
    // Espera coordenadas con el formato: 32.090909, 32,9009090 en el campo gps
    $string = $request_fields['gps'];
    $delimiter = ",";
    $splitted = explode($string, $delimiter);

    $request_fields['coord_x'] = $splitted[0];
    $request_fields['coord_y'] = substr($splitted[1],1);
  }
  else 
  {
    // Si esta vacio viene de la pagina web
    $request_fields['coord_x'] = 0.0;
    $request_fields['coord_y'] = 0.0;
  }

}


?>
