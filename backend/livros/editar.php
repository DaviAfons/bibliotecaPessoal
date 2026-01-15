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

// Recebe os dados do formulário
$dados = json_decode(file_get_contents("php://input"), true);

// Verifica se temos o ID do livro para editar
if (isset($dados['id'])) {
    $livroModel = new Livro($pdo);
    
    // Adicione o $dados['generos'] como último parâmetro
    $sucesso = $livroModel->atualizarCompleto(
        $dados['id'],
        $_SESSION['usuario_id'],
        $dados['titulo'],
        $dados['autor'],
        $dados['ano'],
        $dados['status'],
        $dados['descricao'],
        $dados['imagem'],
        $dados['avaliacao'],
        $dados['generos'] ?? [] 
    );

    echo json_encode(['success' => $sucesso]);
} else {
    echo json_encode(['success' => false, 'message' => 'ID do livro não fornecido']);
}
?>