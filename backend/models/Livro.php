<?php
class Livro {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function criar($usuario_id, $titulo, $autor, $ano, $status, $descricao, $imagem, $avaliacao = 0) {
        try {
            $sql = "INSERT INTO livros (usuario_id, titulo, autor, ano_publicacao, status_leitura, descricao, imagem, avaliacao, favorito) 
                    VALUES (:u_id, :titulo, :autor, :ano, :status, :descricao, :imagem, :avaliacao, 0)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':u_id', $usuario_id);
            $stmt->bindValue(':titulo', $titulo);
            $stmt->bindValue(':autor', $autor);
            $stmt->bindValue(':ano', $ano);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':descricao', $descricao);
            $stmt->bindValue(':imagem', $imagem);
            $stmt->bindValue(':avaliacao', $avaliacao);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            return false;
        }
    }

    // ATUALIZADO: Agora aceita um segundo parâmetro opcional $apenasFavoritos
    public function listarPorUsuario($usuario_id, $apenasFavoritos = false) {
        $sql = "SELECT l.*, 
                GROUP_CONCAT(g.nome SEPARATOR ', ') as generos_nomes,
                GROUP_CONCAT(g.id SEPARATOR ',') as generos_ids
                FROM livros l
                LEFT JOIN livro_genero lg ON l.id = lg.livro_id
                LEFT JOIN generos g ON lg.genero_id = g.id
                WHERE l.usuario_id = :u_id";
        
        if ($apenasFavoritos) {
            $sql .= " AND l.favorito = 1";
        }

        $sql .= " GROUP BY l.id ORDER BY l.criado_em DESC";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':u_id', $usuario_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // NOVO MÉTODO: Alterna entre favorito (1) e não favorito (0)
    public function alternarFavorito($id, $usuario_id) {
        // Primeiro descobrimos o estado atual
        $sql = "SELECT favorito FROM livros WHERE id = :id AND usuario_id = :u_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id, ':u_id' => $usuario_id]);
        $livro = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$livro) return false;

        // Inverte o valor (se era 0 vira 1, se era 1 vira 0)
        $novoEstado = $livro['favorito'] == 1 ? 0 : 1;

        $sqlUpdate = "UPDATE livros SET favorito = :favorito WHERE id = :id";
        $stmtUpdate = $this->conn->prepare($sqlUpdate);
        return $stmtUpdate->execute([':favorito' => $novoEstado, ':id' => $id]);
    }

    public function excluir($id, $usuario_id) {
        try {
            $sql = "DELETE FROM livros WHERE id = :id AND usuario_id = :u_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':u_id', $usuario_id);
            return $stmt->execute();
        } catch (PDOException $e) {
            return false;
        }
    }

    public function atualizarStatus($livro_id, $usuario_id, $novo_status) {
        try {
            $sql = "UPDATE livros SET status_leitura = :status WHERE id = :id AND usuario_id = :u_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':status', $novo_status);
            $stmt->bindValue(':id', $livro_id);
            $stmt->bindValue(':u_id', $usuario_id);
            return $stmt->execute();
        } catch (PDOException $e) {
            return false;
        }
    }

    public function atualizarCompleto($id, $usuario_id, $titulo, $autor, $ano, $status, $descricao, $imagem, $avaliacao, $generos = []) {
        try {
            $sql = "UPDATE livros SET 
                        titulo = :titulo, 
                        autor = :autor, 
                        ano_publicacao = :ano, 
                        status_leitura = :status, 
                        descricao = :descricao, 
                        imagem = :imagem,
                        avaliacao = :avaliacao 
                    WHERE id = :id AND usuario_id = :u_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':titulo', $titulo);
            $stmt->bindValue(':autor', $autor);
            $stmt->bindValue(':ano', $ano);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':descricao', $descricao);
            $stmt->bindValue(':imagem', $imagem);
            $stmt->bindValue(':avaliacao', $avaliacao);
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':u_id', $usuario_id);
            
            $resultado = $stmt->execute();

            if ($resultado) {
                $this->vincularGeneros($id, $generos);
            }

            return $resultado;
        } catch (PDOException $e) {
            return false;
        }
    }

    public function listarGeneros() {
        $sql = "SELECT * FROM generos ORDER BY nome ASC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function vincularGeneros($livro_id, $generos_ids) {
        $sqlDelete = "DELETE FROM livro_genero WHERE livro_id = :id";
        $stmtDel = $this->conn->prepare($sqlDelete);
        $stmtDel->execute(['id' => $livro_id]);

        if (!empty($generos_ids)) {
            $sql = "INSERT INTO livro_genero (livro_id, genero_id) VALUES (:l_id, :g_id)";
            $stmt = $this->conn->prepare($sql);
            foreach ($generos_ids as $g_id) {
                $stmt->execute(['l_id' => $livro_id, 'g_id' => $g_id]);
            }
        }
    }
}
?>