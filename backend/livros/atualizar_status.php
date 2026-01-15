<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

if (isset($dados['id']) && isset($dados['status'])) {
    $livroModel = new Livro($pdo);
    
    // O Model já verifica se o livro pertence ao utilizador logado
    $sucesso = $livroModel->atualizarStatus(
        $dados['id'], 
        $_SESSION['usuario_id'], 
        $dados['status']
    );

    echo json_encode(['success' => $sucesso]);
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
}
?>