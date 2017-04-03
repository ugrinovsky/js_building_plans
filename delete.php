<?php

require('db.php');

$pdo = new Database('mysql:host=localhost;dbname=plugin', 'root', '');

// print_r($_POST);die;

$id = $_POST['id'];
$area = $pdo->delete('areas', ['id' => $id]);

$data['success'] = true;
echo json_encode($data);
