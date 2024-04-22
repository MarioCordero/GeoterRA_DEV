<?php

declare(strict_types=1);

function check_email(object $pdo, string $email)
{
  $query = "SELECT email FROM reg_usr WHERE email = :email;";
  $stmt = $pdo->prepare($query);
  $stmt->bindParam(":email", $email);
  $stmt->execute();

  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result;
}

function insert_to_db(object $pdo, array $user_attributes)
{
  $query = "INSERT INTO reg_usr (username, password, email, first_name, last_name, phone_number) VALUES
('carlos', :password, :email, :first_name, :last_name, :phone_number);";

  $stmt = $pdo->prepare($query);

  $options = [
    'cost' => 12
  ];

  // $hashedPass = password_hash($user_attributes["password"],
  //   PASSWORD_BCRYPT, $options);

  echo "ACA ESTAMOS <br>";

  $stmt->bindParam(":password", $user_attributes["password"]);
  $stmt->bindParam(":email", $user_attributes["email"]);
  $stmt->bindParam(":first_name", $user_attributes["first_name"]);
  $stmt->bindParam(":last_name", $user_attributes["last_name"]);
  $stmt->bindParam(":phone_number", $user_attributes["phone_number"]);

  echo "BINDED";

  $stmt->execute();
}

?>
