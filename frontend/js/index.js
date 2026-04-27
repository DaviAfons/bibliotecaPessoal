document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const btnToggle = document.getElementById('togglePassword');
    const errorDiv = document.getElementById('loginError'); // Captura nossa nova div

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

    // 2. Submissão do Login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Esconde a mensagem de erro sempre que tentar enviar de novo
        errorDiv.style.display = 'none';
        
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
                
                sessionStorage.setItem('usuario', JSON.stringify({
                    nome: result.nome,
                    email: dados.email
                }));
                
                setTimeout(() => { 
                    window.location.href = './frontend/html/biblioteca.html'; 
                }, 1500);
            } else {
                // CHAMA A NOSSA NOVA ANIMAÇÃO DE ERRO
                showInlineError(result.message || 'E-mail ou senha incorretos.');
            }
        } catch (error) {
            console.error('Erro:', error);
            showInlineError('Erro ao conectar com o servidor. Tente novamente.');
        }
    });

    // Função para mostrar o erro e tremer o formulário
    function showInlineError(message) {
        // Coloca o texto e o ícone na div
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorDiv.style.display = 'flex'; // Torna visível

        // Truque de mestre: Remove e adiciona a classe rapidamente para a animação reiniciar
        // caso o usuário erre duas vezes seguidas
        loginForm.classList.remove('shake-animation');
        void loginForm.offsetWidth; // Força o navegador a recalcular o layout (reflow)
        loginForm.classList.add('shake-animation');
    }
});

// Mantivemos a função de notificação apenas para a mensagem verde de "Bem-vindo!"
function showNotification(message, type = 'info') {
    const iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${iconMap[type]}"></i><span>${message}</span>`;
    
    // Pequeno estilo embutido rápido caso o global.css não tenha
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = type === 'success' ? '#28a745' : '#dc3545';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.style.zIndex = '9999';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.4s';
        setTimeout(() => notification.remove(), 400);
    }, 2000);
}