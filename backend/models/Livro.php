<?php
class Livro {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar um novo livro vinculado a um usuário
    public function criar($usuario_id, $titulo, $autor, $ano, $status, $descricao) {
        $sql = "INSERT INTO livros (usuario_id, titulo, autor, ano_publicacao, status_leitura, descricao) 
                VALUES (:u_id, :titulo, :autor, :ano, :status, :descricao)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':u_id', $usuario_id);
        $stmt->bindParam(':titulo', $titulo);
        $stmt->bindParam(':autor', $autor);
        $stmt->bindParam(':ano', $ano);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':descricao', $descricao);
        
        return $stmt->execute();
    }

    // Listar livros de um usuário específico
    public function listarPorUsuario($usuario_id) {
        $sql = "SELECT * FROM livros WHERE usuario_id = :u_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':u_id', $usuario_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Excluir um livro
    public function excluir($id, $usuario_id) {
        $sql = "DELETE FROM livros WHERE id = :id AND usuario_id = :u_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':u_id', $usuario_id);
        return $stmt->execute();
    }

    // Atualizar o status de leitura de um livro
    public function atualizarStatus($livro_id, $usuario_id, $novo_status) {
        // Garantimos que o livro pertence ao usuário logado por segurança
        $sql = "UPDATE livros SET status_leitura = :status WHERE id = :id AND usuario_id = :u_id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':status', $novo_status);
        $stmt->bindParam(':id', $livro_id);
        $stmt->bindParam(':u_id', $usuario_id);
        
        return $stmt->execute();
    }
}
?>