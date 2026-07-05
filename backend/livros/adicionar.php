<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../models/Livro.php';

session_start();

// 1. Verifica autenticação
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

// 2. Recebe os dados JSON
$dados = json_decode(file_get_contents("php://input"), true);

if ($dados) {
    try {
        $livroModel = new Livro($pdo);
        
        // Inicia uma transação para garantir que ou salva tudo ou nada
        $pdo->beginTransaction();

        $caminhoCapa = null;

        // --- UPLOAD FÍSICO DE IMAGEM ---
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
            $caminhoCapa = 'uploads/' . $nomeArquivo; // Apenas o caminho vai para o BD
        }
        // ------------------------------

        // 3. Salva os dados básicos do livro
        $sucesso = $livroModel->criar(
            $_SESSION['usuario_id'],
            $dados['titulo'],
            $dados['autor'],
            $dados['ano'],
            $dados['status'],
            $dados['descricao'],
            $caminhoCapa, 
            $dados['avaliacao']
        );

        if ($sucesso) {
            $livroId = $pdo->lastInsertId(); // Obtém o ID do livro criado

            // 4. Salva os géneros vinculados (se existirem)
            if (isset($dados['generos']) && is_array($dados['generos'])) {
                $livroModel->vincularGeneros($livroId, $dados['generos']);
            }

            $pdo->commit(); // Confirma as alterações no banco
            echo json_encode(['success' => true, 'message' => 'Livro adicionado com sucesso!']);
        } else {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Erro ao inserir no banco de dados.']);
        }

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos ou vazios.']);
}
?>