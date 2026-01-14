<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Usuario.php';

$dados = json_decode(file_get_contents("php://input"), true);

if ($dados) {
    $usuarioModel = new Usuario($pdo);

    // Verificar se o e-mail já existe
    if ($usuarioModel->buscarPorEmail($dados['email'])) {
        echo json_encode(['success' => false, 'message' => 'Este e-mail já está registado.']);
        exit;
    }

    // Tentar cadastrar
    $sucesso = $usuarioModel->cadastrar(
        $dados['nome'],
        $dados['email'],
        $dados['senha'],
        $dados['dataNascimento'],
        $dados['bio']
    );

    if ($sucesso) {
        echo json_encode(['success' => true, 'message' => 'Conta criada com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar no banco de dados.']);
    }
}
?>