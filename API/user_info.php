<?php
require_once 'dbhandler.inc.php'; // include your DB connection script

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get email from the POST request
    $email = $_POST['email'];

    if (!empty($email)) {
        try {
            // Prepare the SQL query
            $stmt = $pdo->prepare("SELECT first_name, last_name, email, phone_number FROM reg_usr WHERE email = :email");
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            // Fetch the user data
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // If user data is found, return it as JSON
            if ($user) {
                echo json_encode([
                    'status' => 'success',
                    'name' => $user['first_name'] . ' ' . $user['last_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone_number']
                ]);
            } else {
                // If no user is found
                echo json_encode(['status' => 'error', 'message' => 'User not found.']);
            }
        } catch (PDOException $e) {
            // Handle any errors
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        // Handle missing email
        echo json_encode(['status' => 'error', 'message' => 'Email is required.']);
    }
}
?>