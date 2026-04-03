<?php
// Define que a resposta será no formato JSON (ideal para o JavaScript ler depois)
header('Content-Type: application/json');

// Importa a conexão e o modelo
require_once '../config/conexao.php';
require_once '../models/Usuario.php';

// Recebe os dados enviados pelo JavaScript
$dados = json_decode(file_get_contents("php://input"));

// Verifica se o email foi enviado
if (!isset($dados->email) || empty($dados->email)) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Por favor, informe o e-mail.']);
    exit;
}

$email = $dados->email;
$usuarioModel = new Usuario($pdo);

// 1. Verifica se o e-mail existe na base de dados
$usuario = $usuarioModel->buscarPorEmail($email);

if ($usuario) {
    // 2. Gera um token (código) aleatório e seguro
    $token = bin2hex(random_bytes(32)); // Exemplo: 3f8a9b...
    
    // 3. Define a expiração para daqui a 1 hora
    $expiracao = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // 4. Salva o token na base de dados
    if ($usuarioModel->salvarTokenRecuperacao($email, $token, $expiracao)) {
        
        // 5. CRIA O LINK DE TESTE LOCAL
        // Como estamos a testar localmente, vamos devolver o link na própria resposta.
        // Nota: Em produção, enviarias este link por e-mail e devolverias apenas uma mensagem de "E-mail enviado".
        $linkRecuperacao = "http://localhost:3000/frontend/html/redefinir_senha.html?token=" . $token;
        
        echo json_encode([
            'sucesso' => true, 
            'mensagem' => 'Se o e-mail existir, um link de recuperação foi gerado.',
            'link_teste' => $linkRecuperacao // O JS vai ler isto e mostrar na tela!
        ]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao processar a solicitação.']);
    }
} else {
    // Por segurança, damos a mesma mensagem de sucesso mesmo se o e-mail não existir.
    // Isso evita que pessoas mal-intencionadas descubram quais e-mails estão registados.
    echo json_encode([
        'sucesso' => true, 
        'mensagem' => 'Se o e-mail existir, um link de recuperação foi gerado.'
    ]);
}
?>