<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

// Recebe o ID via JSON
$dados = json_decode(file_get_contents("php://input"), true);
$livro_id = $dados['id'] ?? null;

if ($livro_id) {
    $livroModel = new Livro($pdo);
    if ($livroModel->alternarFavorito($livro_id, $_SESSION['usuario_id'])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao favoritar']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID inválido']);
}
?>