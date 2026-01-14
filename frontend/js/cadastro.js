document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleção de Elementos (Agrupado para clareza)
    const forms = {
        main: document.getElementById('cadastroForm'),
        senha: document.getElementById('senha'),
        confirmar: document.getElementById('confirmarSenha'),
        bio: document.getElementById('bio'),
        dataNasc: document.getElementById('dataNascimento')
    };

    const ui = {
        charCount: document.querySelector('.char-count'),
        strengthBar: document.querySelector('.strength-bar'),
        strengthText: document.querySelector('.strength-text span'),
        senhaMatch: document.getElementById('senhaMatch')
    };

    // 2. Configurações Iniciais de Data
    const hoje = new Date();
    forms.dataNasc.max = hoje.toISOString().split('T')[0];
    
    const dataPadrao = new Date();
    dataPadrao.setFullYear(hoje.getFullYear() - 18);
    forms.dataNasc.value = dataPadrao.toISOString().split('T')[0];

    // 3. Funções de Utilidade (Refatoradas)
    
    // Alternar visibilidade da senha
    window.togglePassword = (fieldId) => {
        const field = document.getElementById(fieldId);
        const icon = field.nextElementSibling.querySelector('i');
        const isPassword = field.type === 'password';
        
        field.type = isPassword ? 'text' : 'password';
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
    };

    // Força da Senha com Objeto de Configuração (Mais limpo que Switch)
    const updatePasswordStrength = () => {
        const pwd = forms.senha.value;
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;

        const configs = [
            { text: "muito fraca", color: "#c45a5a" },
            { text: "fraca", color: "#c45a5a" },
            { text: "média", color: "#d2691e" },
            { text: "forte", color: "#2d5016" },
            { text: "muito forte", color: "#2a7a2a" }
        ];

        const res = configs[strength];
        ui.strengthBar.style.width = `${(strength / 4) * 100}%`;
        ui.strengthBar.style.backgroundColor = res.color;
        ui.strengthText.textContent = res.text;
        ui.strengthText.style.color = res.color;
    };

    // Validação de coincidência
    const checkPasswordMatch = () => {
        const match = forms.senha.value === forms.confirmar.value;
        const isEmpty = forms.confirmar.value === '';
        
        ui.senhaMatch.textContent = isEmpty ? '' : (match ? '✓ As senhas coincidem' : '✗ As senhas não coincidem');
        ui.senhaMatch.className = `validation-message ${match ? 'success' : 'error'}`;
        forms.confirmar.classList.toggle('valid', match && !isEmpty);
        forms.confirmar.classList.toggle('invalid', !match && !isEmpty);
    };

    // Gestão da Biografia
    const updateBio = () => {
        if (forms.bio.value.length > 200) forms.bio.value = forms.bio.value.substring(0, 200);
        const count = forms.bio.value.length;
        ui.charCount.textContent = `${count}/200 caracteres`;
        ui.charCount.style.color = count > 190 ? '#c45a5a' : (count > 150 ? '#d2691e' : '#666666');
    };

    // 4. Submissão do Formulário
    window.cadastrar = async (event) => {
        event.preventDefault();
        
        const dados = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            dataNascimento: forms.dataNasc.value,
            senha: forms.senha.value,
            confirmar: forms.confirmar.value,
            bio: forms.bio.value.trim(),
            termos: document.getElementById('termos').checked
        };

        // Validações rápidas
        if (!dados.nome || !dados.email || !dados.senha) return showNotification('Preencha os campos obrigatórios', 'error');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) return showNotification('Email inválido', 'error');
        if (dados.senha !== dados.confirmar) return showNotification('As senhas não coincidem', 'error');
        if (!dados.termos) return showNotification('Aceite os termos', 'error');

        try {
            const response = await fetch('../../backend/auth/cadastro.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            const result = await response.json();

            if (result.success) {
                document.getElementById('successModal').classList.add('show');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Erro na comunicação com o servidor.', 'error');
        }
    };

    // 5. Event Listeners (Centralizados)
    forms.senha.addEventListener('input', () => { updatePasswordStrength(); checkPasswordMatch(); });
    forms.confirmar.addEventListener('input', checkPasswordMatch);
    forms.bio.addEventListener('input', updateBio);
    
    // Iniciar notificações e estilos (executa uma vez)
    injectStyles();
    updateBio();
});

// Função de Notificação fora do DOMContentLoaded para ser global se necessário
function showNotification(message, type = 'info') {
    const iconMap = { 
        success: 'check-circle', 
        error: 'exclamation-circle', 
        warning: 'exclamation-triangle', 
        info: 'info-circle' 
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${iconMap[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Pequeno delay para a animação de entrada funcionar
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove a notificação após 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400); // Espera a animação de saída terminar
    }, 4000);
}

function injectStyles() {
    if (document.querySelector('style[data-notifications]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-notifications', '');
    style.textContent = `.notification { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 10px; background: white; box-shadow: 0 5px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; z-index: 10000; transform: translateX(150%); transition: 0.4s; border-left: 4px solid #2c7be5; } .notification.show { transform: translateX(0); } .notification.success { border-left-color: #00a854; } .notification.error { border-left-color: #f5222d; }`; // ... (restante do CSS omitido por brevidade, mas mantido no seu original)
    document.head.appendChild(style);
}