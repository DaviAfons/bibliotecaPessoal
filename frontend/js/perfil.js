document.addEventListener('DOMContentLoaded', () => {
    carregarDadosPerfil();

    // Visualizar imagem assim que o utilizador seleciona um arquivo
    const fotoInput = document.getElementById('fotoInput');
    const avatarPreview = document.getElementById('avatarPreview');

    fotoInput.addEventListener('change', function() {
        const arquivo = this.files[0];
        if (arquivo) {
            const leitor = new FileReader();
            leitor.onload = function(e) {
                avatarPreview.src = e.target.result;
            }
            leitor.readAsDataURL(arquivo);
        }
    });

    // Enviar formulário
    const form = document.getElementById('perfilForm');
    form.addEventListener('submit', salvarPerfil);
});

async function carregarDadosPerfil() {
    try {
        const response = await fetch('../../backend/auth/get_perfil.php');
        const data = await response.json();

        if (data.success) {
            const usuario = data.dados;
            document.getElementById('nome').value = usuario.nome;
            document.getElementById('bio').value = usuario.bio || '';

            // Se tiver foto, mostra. Se não, usa um gerador de avatar com as iniciais
            if (usuario.foto_perfil) {
                // Adiciona '../' porque a imagem vem como 'uploads/foto.jpg' do banco
                document.getElementById('avatarPreview').src = '../' + usuario.foto_perfil;
            } else {
                // Avatar automático com as iniciais do nome
                document.getElementById('avatarPreview').src = `https://ui-avatars.com/api/?name=${usuario.nome}&background=efe7dd&color=5a1a1b`;
            }
        } else {
            // Se não estiver logado, manda para o login
            window.location.href = '../../index.html';
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

async function salvarPerfil(e) {
    e.preventDefault();
    
    const btn = document.querySelector('.btn-login');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btn.disabled = true;

    const form = document.getElementById('perfilForm');
    // FormData é essencial para enviar Arquivos + Texto
    const formData = new FormData(form);

    try {
        const response = await fetch('../../backend/auth/atualizar_perfil.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        const msgDiv = document.getElementById('mensagem');

        msgDiv.style.display = 'block';
        if (data.success) {
            msgDiv.className = 'alert alert-success';
            msgDiv.textContent = 'Perfil atualizado com sucesso!';
        } else {
            msgDiv.className = 'alert alert-error';
            msgDiv.textContent = data.message || 'Erro ao atualizar.';
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function logout() {
    // Podes implementar uma chamada ao backend para destruir a sessão aqui se quiseres
    // Por enquanto, apenas redireciona
    window.location.href = '../../index.html';
}