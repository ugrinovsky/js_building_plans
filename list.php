<?php

require('db.php');

$pdo = new Database('mysql:host=localhost;dbname=plugin', 'root', '');

$areas = $pdo->select('* FROM areas');
$data['areas'] = $areas;
$data['success'] = true;
echo json_encode($data);