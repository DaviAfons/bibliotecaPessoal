<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

$livroModel = new Livro($pdo);
$generos = $livroModel->listarGeneros();

echo json_encode($generos);
?>