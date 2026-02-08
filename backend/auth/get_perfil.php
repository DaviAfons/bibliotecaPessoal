<?php
header('Content-Type: application/json');
session_start();
require_once '../config/conexao.php';
require_once '../models/Usuario.php';

// Verifica se o utilizador está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Utilizador não autenticado.']);
    exit;
}

$id = $_SESSION['usuario_id'];
$usuarioModel = new Usuario($pdo);
$dados = $usuarioModel->buscarPorId($id);

if ($dados) {
    echo json_encode(['success' => true, 'dados' => $dados]);
} else {
    echo json_encode(['success' => false, 'message' => 'Utilizador não encontrado.']);
}
?>