<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

if (isset($dados['id'])) {
    $livroModel = new Livro($pdo);
    $caminhoCapa = $dados['imagem'] ?? null; 
    
    try {
        // --- BUSCA DA IMAGEM ANTIGA PARA EXCLUSÃO ---
        $stmtAntiga = $pdo->prepare("SELECT imagem FROM livros WHERE id = :id AND usuario_id = :u_id");
        $stmtAntiga->execute([':id' => $dados['id'], ':u_id' => $_SESSION['usuario_id']]);
        $livroAntigo = $stmtAntiga->fetch(PDO::FETCH_ASSOC);
        $imagemAntiga = $livroAntigo ? $livroAntigo['imagem'] : null;

        // --- UPLOAD DE NOVA IMAGEM ---
        if (!empty($dados['imagem']) && strpos($dados['imagem'], 'data:image') === 0) {
            
            $partes = explode(',', $dados['imagem']);
            $conteudoImagem = base64_decode($partes[1]);
            
            preg_match('/^data:image\/(\w+);/i', $partes[0], $match);
            $extensao = $match[1] ?? 'jpg';
            
            $nomeArquivo = uniqid('capa_') . '.' . $extensao;
            $pastaUploads = __DIR__ . '/../../uploads';
            
            if (!is_dir($pastaUploads)) {
                mkdir($pastaUploads, 0777, true);
            }
            
            file_put_contents($pastaUploads . '/' . $nomeArquivo, $conteudoImagem);
            $caminhoCapa = 'uploads/' . $nomeArquivo;
            
            // EXCLUI A CAPA ANTIGA DO SERVIDOR PARA ECONOMIZAR ESPAÇO
            if ($imagemAntiga && strpos($imagemAntiga, 'uploads/') === 0) {
                $caminhoCompletoAntiga = __DIR__ . '/../../' . $imagemAntiga;
                if (file_exists($caminhoCompletoAntiga)) {
                    unlink($caminhoCompletoAntiga);
                }
            }
        }
        // -----------------------------

        $sucesso = $livroModel->atualizarCompleto(
            $dados['id'],
            $_SESSION['usuario_id'],
            $dados['titulo'],
            $dados['autor'],
            $dados['ano'],
            $dados['status'],
            $dados['descricao'],
            $caminhoCapa, 
            $dados['avaliacao'],
            $dados['generos'] ?? [] 
        );

        if ($sucesso) {
            echo json_encode(['success' => true, 'message' => 'Livro atualizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro: Nenhuma alteração foi feita ou falha no banco de dados.']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro interno SQL: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'ID do livro não fornecido']);
}
?>