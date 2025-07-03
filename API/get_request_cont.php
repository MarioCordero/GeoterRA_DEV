<?php
	function get_requests(object $pdo, array $request_fields) {
		return select_from_db($pdo, $request_fields);
	}
?>
