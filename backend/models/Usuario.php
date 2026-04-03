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

    public function salvarTokenRecuperacao($email, $token, $expiracao) {
        $sql = "UPDATE usuarios SET token_recuperacao = :token, token_expiracao = :expiracao WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':expiracao', $expiracao);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }

    // NOVA FUNÇÃO: Busca o utilizador pelo token, verificando se não expirou
    public function buscarPorToken($token) {
        // Verifica se o token coincide e se a data de expiração é maior que a data atual
        $sql = "SELECT * FROM usuarios WHERE token_recuperacao = :token AND token_expiracao > NOW()";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // NOVA FUNÇÃO: Atualiza a senha e limpa o token de recuperação
    public function redefinirSenha($id, $novaSenha) {
        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        // Atualiza a senha e anula o token para que não possa ser usado novamente
        $sql = "UPDATE usuarios SET senha = :senha, token_recuperacao = NULL, token_expiracao = NULL WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':senha', $senhaHash);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
} 
?>