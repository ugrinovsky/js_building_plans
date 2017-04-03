<?php

require('db.php');

$pdo = new Database('mysql:host=localhost;dbname=plugin', 'root', '');

// print_r($_POST);die;

$points = $_POST['points'];
$id = $pdo->insert('areas', ['points' => $points]);
$area = $pdo->select('* FROM areas WHERE id = :id', [':id' => $id]);

$data['area'] = $area[0];
$data['success'] = true;
echo json_encode($data);
