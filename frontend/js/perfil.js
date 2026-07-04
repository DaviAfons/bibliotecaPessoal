document.addEventListener('DOMContentLoaded', () => {
    carregarDadosPerfil();

    const fotoInput = document.getElementById('fotoInput');
    const avatarPreview = document.getElementById('avatarPreview');

    fotoInput.addEventListener('change', function () {
        const arquivo = this.files[0];
        if (!arquivo) return;
        const leitor = new FileReader();
        leitor.onload = (e) => {
            avatarPreview.style.transition = 'opacity 0.25s ease';
            avatarPreview.style.opacity = '0';
            setTimeout(() => {
                avatarPreview.src = e.target.result;
                avatarPreview.style.opacity = '1';
            }, 250);
        };
        leitor.readAsDataURL(arquivo);
    });

    document.getElementById('perfilForm').addEventListener('submit', salvarPerfil);
});

async function carregarDadosPerfil() {
    try {
        const response = await fetch('../../backend/auth/get_perfil.php');
        const data = await response.json();

        if (data.success) {
            const u = data.dados;
            document.getElementById('nome').value = u.nome;
            document.getElementById('bio').value = u.bio || '';

            document.getElementById('avatarPreview').src = u.foto_perfil
                ? '../' + u.foto_perfil
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=efe7dd&color=5a1a1b`;
        } else {
            window.location.href = '../../index.html';
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

async function salvarPerfil(e) {
    e.preventDefault();

    const btn = document.querySelector('.btn-login');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch" style="animation: spin 0.8s linear infinite;"></i> Salvando...';
    btn.disabled = true;

    try {
        const response = await fetch('../../backend/auth/atualizar_perfil.php', {
            method: 'POST',
            body: new FormData(document.getElementById('perfilForm'))
        });

        const data = await response.json();

        if (data.success) {
            mostrarToast('success', '<i class="fas fa-check-circle"></i> Perfil atualizado com sucesso!');
        } else {
            mostrarToast('error', `<i class="fas fa-exclamation-circle"></i> ${data.message || 'Erro ao atualizar.'}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarToast('error', '<i class="fas fa-wifi"></i> Erro de conexão. Tente novamente.');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ── Toast ─────────────────────────────────────────
let toastTimer = null;

function mostrarToast(tipo, htmlContent) {
    const msgDiv = document.getElementById('mensagem');

    // Cancela timer anterior se ainda estiver rodando
    if (toastTimer) {
        clearTimeout(toastTimer);
        msgDiv.classList.remove('show', 'hide');
        // Força reflow para reiniciar animação
        void msgDiv.offsetWidth;
    }

    msgDiv.className = `alert alert-${tipo} show`;
    msgDiv.innerHTML = htmlContent;

    const duracao = tipo === 'error' ? 4500 : 3500;

    toastTimer = setTimeout(() => {
        msgDiv.classList.remove('show');
        msgDiv.classList.add('hide');
        setTimeout(() => {
            msgDiv.className = 'alert';
        }, 400);
        toastTimer = null;
    }, duracao);
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../../index.html';
}