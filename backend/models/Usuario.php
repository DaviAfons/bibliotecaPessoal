<?php
class Usuario {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Cria um novo utilizador
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

    // Busca utilizador por e-mail (Login)
    public function buscarPorEmail($email) {
        $sql = "SELECT * FROM usuarios WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // NOVA FUNÇÃO: Busca dados pelo ID (Para exibir no Perfil)
    public function buscarPorId($id) {
        $sql = "SELECT id, nome, email, data_nascimento, bio, foto_perfil FROM usuarios WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // NOVA FUNÇÃO: Atualiza os dados do utilizador
    public function atualizar($id, $nome, $bio, $foto_perfil) {
        // Se a foto_perfil vier vazia, não a alteramos no SQL (truque de lógica)
        if ($foto_perfil) {
            $sql = "UPDATE usuarios SET nome = :nome, bio = :bio, foto_perfil = :foto WHERE id = :id";
        } else {
            $sql = "UPDATE usuarios SET nome = :nome, bio = :bio WHERE id = :id";
        }

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':bio', $bio);
        $stmt->bindParam(':id', $id);
        
        if ($foto_perfil) {
            $stmt->bindParam(':foto', $foto_perfil);
        }

        return $stmt->execute();
    }
} 
?>