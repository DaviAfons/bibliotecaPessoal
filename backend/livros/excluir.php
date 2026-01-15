<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

// Verifica se o utilizador está autenticado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

// Recebe o ID via URL (ex: excluir.php?id=5)
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($id) {
    $livroModel = new Livro($pdo);
    // Usa o teu método que valida tanto o ID do livro quanto o do dono
    $sucesso = $livroModel->excluir($id, $_SESSION['usuario_id']);

    echo json_encode(['success' => $sucesso]);
} else {
    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
}
?>