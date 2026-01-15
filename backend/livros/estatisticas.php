<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';

session_start();
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}
$usuario_id = $_SESSION['usuario_id'];

$sql = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status_leitura = 'lido' THEN 1 ELSE 0 END) as lidos,
            SUM(CASE WHEN status_leitura = 'lendo' THEN 1 ELSE 0 END) as lendo
        FROM livros WHERE usuario_id = :id";

$stmt = $pdo->prepare($sql);
$stmt->execute(['id' => $usuario_id]);
echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));