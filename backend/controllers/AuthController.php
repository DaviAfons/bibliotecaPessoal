<?php
require_once './backend/config/conexao.php';
require_once './backend/models/Usuario.php';

class AuthController {
    public function login($email, $senha) {
        global $pdo;
        $usuarioModel = new Usuario($pdo);
        $user = $usuarioModel->buscarPorEmail($email);

        if ($user && password_verify($senha, $user['senha'])) {
            session_start();
            $_SESSION['usuario_id'] = $user['id'];
            echo json_encode(["sucess" => true, "message" => "Login realizado!"]);
        } else {
            echo json_encode(["sucess" => false, "message" => "E-Mail ou senha inválidos."]);
        }
    }

    // Método de Logout
    public function logout() {
        // Inicia a sessão se ainda não estiver iniciada para poder destruí-la
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Limpa todas as variáveis de sessão
        $_SESSION = array();

        // Destrói a sessão no servidor
        session_destroy();

        // Retorna uma resposta de sucesso
        echo json_encode([
            "success" => true, 
            "message" => "Sessão encerrada com sucesso."
        ]);
    }

    // Método para verificar se o usuário está logado
    public static function estaLogado() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['usuario_id'])) {
            // Se não houver sessão, retorna erro e encerra a execução
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Acesso negado. Faça login para continuar."]);
            exit();
        }
        
        return $_SESSION['usuario_id'];
    }
}
?>