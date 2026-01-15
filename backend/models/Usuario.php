<?php
class Usuario {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function cadastrar($nome, $email, $senha, $data_nascimento, $bio) {
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        $sql = "INSERT INTO usuarios (nome, email, senha, data_nascimento, bio) 
                VALUES (:nome, :email, :senha, :data_nasc, :bio)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':senha', $senhaHash);
        $stmt->bindParam(':data_nasc', $data_nascimento);
        $stmt->bindParam(':bio', $bio);
        
        return $stmt->execute();
    }
    // Função para buscar usuário por email (usado no login)
    public function buscarPorEmail($email) {
        $sql = "SELECT * FROM usuarios WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
} 
?>