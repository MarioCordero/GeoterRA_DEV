<?php
  declare(strict_types=1);
  require_once 'cors.inc.php';
  function request_points(object $pdo, string $region) {
    $values = request_table_data($pdo, $region);
    if (!empty($values)) {
      return $values;
    }
    return 1;
  }

?>
