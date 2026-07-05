<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';

session_start();
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}
$uid = $_SESSION['usuario_id'];

// ── 1. Livros por status ──────────────────────────────────────────────────────
$sqlStatus = "
    SELECT 
        SUM(CASE WHEN status_leitura = 'lido'     THEN 1 ELSE 0 END) AS lidos,
        SUM(CASE WHEN status_leitura = 'lendo'    THEN 1 ELSE 0 END) AS lendo,
        SUM(CASE WHEN status_leitura = 'nao_lido' THEN 1 ELSE 0 END) AS nao_lidos,
        COUNT(*) AS total
    FROM livros
    WHERE usuario_id = :uid
";
$stmtS = $pdo->prepare($sqlStatus);
$stmtS->execute(['uid' => $uid]);
$status = $stmtS->fetch(PDO::FETCH_ASSOC);

// ── 2. Livros por gênero (todos os status) ───────────────────────────────────
$sqlGeneros = "
    SELECT g.nome, COUNT(lg.livro_id) AS total
    FROM generos g
    INNER JOIN livro_genero lg ON lg.genero_id = g.id
    INNER JOIN livros l        ON l.id = lg.livro_id
    WHERE l.usuario_id = :uid
    GROUP BY g.id, g.nome
    ORDER BY total DESC
";
$stmtG = $pdo->prepare($sqlGeneros);
$stmtG->execute(['uid' => $uid]);
$generos = $stmtG->fetchAll(PDO::FETCH_ASSOC);

// ── 3. Avaliação média por gênero (só livros com avaliação > 0) ──────────────
$sqlAval = "
    SELECT g.nome, ROUND(AVG(l.avaliacao), 1) AS media
    FROM generos g
    INNER JOIN livro_genero lg ON lg.genero_id = g.id
    INNER JOIN livros l        ON l.id = lg.livro_id
    WHERE l.usuario_id = :uid AND l.avaliacao > 0
    GROUP BY g.id, g.nome
    ORDER BY media DESC
";
$stmtA = $pdo->prepare($sqlAval);
$stmtA->execute(['uid' => $uid]);
$avaliacoes = $stmtA->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success'    => true,
    'status'     => $status,
    'generos'    => $generos,
    'avaliacoes' => $avaliacoes,
]);