<?php
header('Content-Type: application/json');

require_once '../config/conexao.php';
require_once '../models/Usuario.php';

$dados = json_decode(file_get_contents("php://input"));

// Verifica se o token e a nova senha foram enviados
if (!isset($dados->token) || empty($dados->token) || !isset($dados->nova_senha) || empty($dados->nova_senha)) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos.']);
    exit;
}

$token = $dados->token;
$novaSenha = $dados->nova_senha;

$usuarioModel = new Usuario($pdo);

// 1. Verifica se o token existe e ainda é válido (não expirou)
$usuario = $usuarioModel->buscarPorToken($token);

if ($usuario) {
    // 2. Se for válido, atualiza a senha no banco de dados
    if ($usuarioModel->redefinirSenha($usuario['id'], $novaSenha)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Senha alterada com sucesso! Você já pode fazer login.']);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao alterar a senha.']);
    }
} else {
    // Se o token for inválido, falso ou estiver expirado
    echo json_encode(['sucesso' => false, 'mensagem' => 'O link de recuperação é inválido ou expirou. Tente solicitar novamente.']);
}
?>