<?php
header('Content-Type: application/json');

require_once '../../vendor/autoload.php';
require_once '../config/conexao.php';
require_once '../models/Usuario.php';


$dados = json_decode(file_get_contents("php://input"));
$email = $dados->email ?? null;

if (!$email) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail obrigatório.']);
    exit;
}

$usuarioModel = new Usuario($pdo);
$usuario = $usuarioModel->buscarPorEmail($email);

if ($usuario) {
    $token = bin2hex(random_bytes(32));
    $expiracao = date('Y-m-d H:i:s', strtotime('+1 hour'));

    if ($usuarioModel->salvarTokenRecuperacao($email, $token, $expiracao)) {
        // Gera o link
        $link = "http://localhost:3000/frontend/html/redefinir_senha.html?token=" . $token;
        
        // MODO DESENVOLVEDOR: Retorna o link diretamente no JSON
        echo json_encode([
            'sucesso' => true, 
            'mensagem' => 'Link gerado com sucesso (Modo Teste).',
            'link_dev' => $link // Variável adicionada para o frontend capturar
        ]);
        exit;
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao gravar token no banco de dados.']);
        exit;
    }
}

// Resposta padrão caso o e-mail não exista
echo json_encode(['sucesso' => false, 'mensagem' => 'Se o e-mail existir, o link será gerado.']);