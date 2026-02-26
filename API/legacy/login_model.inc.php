<?php
    declare(strict_types=1);
    require_once 'cors.inc.php'; // Include CORS configuration

    function get_user_by_email(object $pdo, string $email){
        $query = "SELECT email, password FROM reg_usr WHERE email = :email;";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
?>