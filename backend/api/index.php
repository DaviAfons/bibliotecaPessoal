<?php
// Exemplo rápido para testar se a conexão e o modelo funcionam
require_once './backend/config/conexao.php';
require_once './backend/models/Livro.php';

header('Content-Type: application/json');

$livroModel = new Livro($pdo);
// Simulando a busca de livros do usuário ID 1
echo json_encode($livroModel->listarPorUsuario(1));
?>