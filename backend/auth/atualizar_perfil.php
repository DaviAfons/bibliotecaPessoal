<?php
header('Content-Type: application/json');
session_start();
require_once '../config/conexao.php';
require_once '../models/Usuario.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autenticado.']);
    exit;
}

$id = $_SESSION['usuario_id'];
$nome = $_POST['nome'] ?? ''; // Usa $_POST porque vamos enviar via FormData (arquivos)
$bio = $_POST['bio'] ?? '';
$fotoCaminho = null;

// Lógica de Upload de Imagem
if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    $extensao = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
    $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif'];

    if (in_array($extensao, $extensoesPermitidas)) {
        // Gera um nome único para não substituir fotos de outros
        $novoNome = uniqid() . "." . $extensao;
        // Caminho onde o ficheiro vai ficar (pasta frontend/uploads)
        $destino = "../../frontend/uploads/" . $novoNome;

        if (move_uploaded_file($_FILES['foto']['tmp_name'], $destino)) {
            // Caminho relativo para salvar no banco (para o HTML aceder)
            $fotoCaminho = "uploads/" . $novoNome;
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao guardar a imagem.']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Formato de imagem inválido.']);
        exit;
    }
}

$usuarioModel = new Usuario($pdo);
// Passamos $fotoCaminho (pode ser a string do caminho ou null se não enviou foto)
if ($usuarioModel->atualizar($id, $nome, $bio, $fotoCaminho)) {
    // Atualiza o nome na sessão também, caso tenha mudado
    $_SESSION['usuario_nome'] = $nome;
    echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!', 'nova_foto' => $fotoCaminho]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar no banco de dados.']);
}
?>