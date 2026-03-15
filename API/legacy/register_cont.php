<?php

    declare(strict_types=1);
    function params_empty(array $user_params){
        foreach ($user_params as $key => $value) {
            // Skip confirm_password if it exists, as it's not required for registration
            if($key === 'confirm_password') {
                continue;
            }
            if(empty($value)) {
                return true;
            }
        }
        return false;
    }

    function input_valid(array $user_params, &$errors) {

        if (filter_var($user_params["email"], FILTER_VALIDATE_EMAIL) === false) {
            $errors["inv_email"] = "Correo invalido";
        }

        // Updated regex to allow multiple names with spaces, hyphens, and apostrophes
        // This should allow "Mario" and "Mario Gabriel"
        if (!preg_match("/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+(?: [a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+)*[\s\-']*$/u", $user_params["first_name"])) {
            $errors["inv_first_name"] = "Nombre invalido";
        }

        if (!preg_match("/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+(?: [a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+)*$/u", $user_params["last_name"])) {
            $errors["inv_last_name"] = "Apellido invalido";
        }

        if (!preg_match("/^\d{8}$/", $user_params["phone_num"])) {
            $errors["inv_phone_num"] = "Numero de telefono invalido";
        }
    }

    function is_email_used(object $pdo, string $email)
    {
        if (check_email($pdo, $email)) { 
            return true; 
        }
        else {
            return false;
        } 
    }

    function insert_user(object $pdo, array $user_params){
        if(insert_to_db($pdo, $user_params)){
            return true; 
        } else {
            return false;
        }
    }
?>