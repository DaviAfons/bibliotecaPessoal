<?php
class Usuario {
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Função para cadastrar um novo usuário
    public function cadastrar ($nome, $email, $senha) {
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT); // Criptografia a senha
        $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':senha', $senhaHash);
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