<?php
require_once './backend/config/conexao.php';
require_once './backend/models/Livro.php';
require_once './backend/controllers/AuthController.php';

class LivroController {
    private $livroModel;

    public function __construct() {
        global $pdo; // Vem do conexao.php
        $this->livroModel = new Livro($pdo);
        
        // Inicia a sessão para verificar se o usuário está logado
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function listarLivros() {
        // Verifica se está logado antes de prosseguir
        $usuario_id = AuthController::estaLogado(); 
        
        // Se passar daqui, o usuário está logado
        return $this->livroModel->listarPorUsuario($usuario_id);
    }

    // Função para buscar livros do usuário logado
    public function exibirLivros() {
        if (!isset($_SESSION['usuario_id'])) {
            return ["erro" => "Não autorizado"];
        }
        return $this->livroModel->listarPorUsuario($_SESSION['usuario_id']);
    }

    // Função para salvar um livro novo
    public function salvarLivro($dados) {
        if (!isset($_SESSION['usuario_id'])) {
            return ["erro" => "Não autorizado"];
        }

        return $this->livroModel->criar(
            $_SESSION['usuario_id'],
            $dados['titulo'],
            $dados['autor'],
            $dados['ano_publicacao'] ?? null,
            $dados['status_leitura'] ?? 'nao_lido',
            $dados['descricao'] ?? null
        );
    }

    public function mudarStatus($livro_id, $novo_status) {
        // 1. Verifica segurança (está logado?)
        $usuario_id = AuthController::estaLogado();

        // 2. Lista de status permitidos (conforme o ENUM no banco)
        $statusPermitidos = ['lido', 'lendo', 'nao_lido'];
        
        if (!in_array($novo_status, $statusPermitidos)) {
            return ["success" => false, "message" => "Status inválido."];
        }

        // 3. Executa a atualização
        if ($this->livroModel->atualizarStatus($livro_id, $usuario_id, $novo_status)) {
            return ["success" => true, "message" => "Status atualizado!"];
        }
        
        return ["success" => false, "message" => "Erro ao atualizar status."];
    }
}
?>