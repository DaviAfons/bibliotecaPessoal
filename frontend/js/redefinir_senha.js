document.getElementById('formRedefinirSenha').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const novaSenha = document.getElementById('novaSenha').value;
    const mensagemDiv = document.getElementById('mensagemRedefinir');
    
    // Captura o token diretamente da URL do navegador
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        mensagemDiv.innerHTML = '<p style="color: red;">Link de recuperação inválido ou ausente.</p>';
        return;
    }

    mensagemDiv.innerHTML = "A salvar nova senha...";

    try {
        const response = await fetch('../../backend/auth/redefinir_senha.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token, nova_senha: novaSenha })
        });
        
        const data = await response.json();

        if (data.sucesso) {
            mensagemDiv.innerHTML = `<p style="color: green;">${data.mensagem}</p>`;
            // Redireciona para o login após 3 segundos
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 3000);
        } else {
            mensagemDiv.innerHTML = `<p style="color: red;">${data.mensagem}</p>`;
        }
    } catch (error) {
        mensagemDiv.innerHTML = '<p style="color: red;">Erro ao conectar com o servidor.</p>';
    }
});