<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$livroModel = new Livro($pdo);

// Verifica se existe o parâmetro GET 'favoritos' e converte para booleano
$apenasFavoritos = isset($_GET['favoritos']) && $_GET['favoritos'] == '1';

$livros = $livroModel->listarPorUsuario($_SESSION['usuario_id'], $apenasFavoritos);

echo json_encode(['success' => true, 'livros' => $livros]);
?>