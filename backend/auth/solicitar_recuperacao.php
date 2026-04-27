<?php
header('Content-Type: application/json');

require_once '../config/conexao.php';
require_once '../models/Usuario.php';

require_once '../../vendor/autoload.php';

// Importa as classes do PHPMailer para o escopo global
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$dados = json_decode(file_get_contents("php://input"));

if (!isset($dados->email) || empty($dados->email)) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Por favor, informe o e-mail.']);
    exit;
}

$email = $dados->email;
$usuarioModel = new Usuario($pdo);
$usuario = $usuarioModel->buscarPorEmail($email);

if ($usuario) {
    $token = bin2hex(random_bytes(32));
    $expiracao = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    if ($usuarioModel->salvarTokenRecuperacao($email, $token, $expiracao)) {
        
        $linkRecuperacao = "http://localhost:3000/frontend/html/redefinir_senha.html?token=" . $token;
        
        // --- INÍCIO DA CONFIGURAÇÃO DO PHPMAILER ---
        $mail = new PHPMailer(true);

        try {
            // Configurações do Servidor SMTP (Exemplo usando GMAIL)
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; 
            $mail->SMTPAuth   = true;
            
            // COLOQUE SEU E-MAIL E SENHA DE APLICATIVO AQUI
            $mail->Username   = 'seu_email@gmail.com'; 
            $mail->Password   = 'sua_senha_de_app_aqui'; 
            
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            // Remetente e Destinatário
            $mail->setFrom('seu_email@gmail.com', 'Biblioteca Pessoal');
            $mail->addAddress($email, $usuario['nome']);

            // Conteúdo do E-mail
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = 'Recuperação de Senha - Biblioteca Pessoal';
            
            // Corpo do e-mail em HTML
            $mail->Body = "
                <h2>Olá, {$usuario['nome']}!</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta na <b>Biblioteca Pessoal</b>.</p>
                <p>Clique no link abaixo para criar uma nova senha:</p>
                <p><a href='{$linkRecuperacao}' style='background-color: #722F37; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;'>Redefinir minha senha</a></p>
                <p><small>Este link expira em 1 hora. Se você não solicitou isso, pode ignorar este e-mail em segurança.</small></p>
            ";

            // Corpo do e-mail em texto puro (para clientes de e-mail que não suportam HTML)
            $mail->AltBody = "Olá, {$usuario['nome']}! Você solicitou a recuperação de senha. Copie e cole este link no seu navegador para redefinir: {$linkRecuperacao}";

            $mail->send();
            
            echo json_encode([
                'sucesso' => true, 
                'mensagem' => 'Se o e-mail existir em nossa base, um link de recuperação foi enviado para a sua caixa de entrada.'
            ]);
            
        } catch (Exception $e) {
            // Em produção, não enviamos o erro real para a tela do usuário. 
            // Mas para testes locais, isso vai nos ajudar a descobrir se a senha do e-mail está errada, etc.
            echo json_encode(['sucesso' => false, 'mensagem' => "Erro ao enviar e-mail: {$mail->ErrorInfo}"]);
        }
        // --- FIM DA CONFIGURAÇÃO DO PHPMAILER ---

    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao processar a solicitação no banco de dados.']);
    }
} else {
    // Mantemos a segurança de não revelar se o e-mail existe ou não
    echo json_encode([
        'sucesso' => true, 
        'mensagem' => 'Se o e-mail existir em nossa base, um link de recuperação foi enviado para a sua caixa de entrada.'
    ]);
}
?>