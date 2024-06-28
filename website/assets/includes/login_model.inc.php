<?php

	declare(strict_types=1);

	function get_email(object $pdo, string $email){

		$query = "SELECT email FROM reg_usr WHERE email = :email;";
		$stmt = $pdo->prepare($query);
		$stmt->bindParam(":email", $email);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return $result;
	}

	function get_pass(object $pdo, string $password){

		$query = "SELECT password FROM reg_usr WHERE password = :password;";
		$stmt = $pdo->prepare($query);
		$stmt->bindParam(":password", $password);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return $result;
	}
	
?>