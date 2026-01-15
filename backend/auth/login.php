<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Usuario.php';

// Recebe os dados do formulário (index.js)
$dados = json_decode(file_get_contents("php://input"), true);

if ($dados) {
    $email = $dados['email'];
    $senha = $dados['senha'];

    $usuarioModel = new Usuario($pdo);
    $usuario = $usuarioModel->buscarPorEmail($email);

    // Verifica se o usuário existe e se a senha coincide
    if ($usuario && password_verify($senha, $usuario['senha'])) {
        // Inicia a sessão para manter o usuário logado
        session_start();
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['nome'];

        echo json_encode([
            'success' => true, 
            'nome' => $usuario['nome'],
            'usuario' => [
                'id' => $usuario['id'],
                'email' => $usuario['email']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'E-mail ou senha incorretos.']);
    }
}
?>