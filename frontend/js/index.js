document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const btnToggle = document.getElementById('togglePassword');

    // 1. Alternar Visibilidade da Senha
    if (btnToggle) {
        btnToggle.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const isPassword = senhaInput.type === 'password';
            senhaInput.type = isPassword ? 'text' : 'password';
            icon.classList.toggle('fa-eye', !isPassword);
            icon.classList.toggle('fa-eye-slash', isPassword);
        });
    }

    // 2. Submissão do Login (ADICIONADO ASYNC AQUI)
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const dados = {
            email: emailInput.value.trim(),
            senha: senhaInput.value
        };

        try {
            // Chamada ao Backend (PHP)
            const response = await fetch('./backend/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const result = await response.json();

            if (result.success) {
                showNotification(`Bem-vindo!`, 'success');
                
                // Salva o usuário para usar o nome na biblioteca
                sessionStorage.setItem('usuario', JSON.stringify({
                    nome: result.nome,
                    email: dados.email
                }));
                
                setTimeout(() => { 
                    window.location.href = './frontend/html/biblioteca.html'; 
                }, 1500);
            } else {
                showNotification(result.message || ' Erro ao entrar.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro ao conectar com o servidor.', 'error');
        }
    });
});

// Função global de notificação
function showNotification(message, type = 'info') {
    const iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${iconMap[type]}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}