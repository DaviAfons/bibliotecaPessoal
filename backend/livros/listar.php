<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$livroModel = new Livro($pdo);
$livros = $livroModel->listarPorUsuario($_SESSION['usuario_id']);

echo json_encode(['success' => true, 'livros' => $livros]);
?>