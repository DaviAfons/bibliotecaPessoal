document.getElementById('formEsqueceuSenha').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que a página recarregue
    
    const email = document.getElementById('email').value;
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.innerHTML = "Processando...";

    try {
        // Envia o email para o nosso ficheiro PHP
        const response = await fetch('../../backend/auth/solicitar_recuperacao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();

        // Se deu sucesso e gerou o link de teste (ambiente local)
        if (data.sucesso && data.link_teste) {
            mensagemDiv.innerHTML = `
                <p style="color: green;">${data.mensagem}</p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 15px;">
                    <strong>LINK DE TESTE LOCAL:</strong><br>
                    <a href="${data.link_teste}">Clique aqui para redefinir a senha</a>
                </div>`;
        } else {
            mensagemDiv.innerHTML = `<p style="color: red;">${data.mensagem}</p>`;
        }
    } catch (error) {
        mensagemDiv.innerHTML = '<p style="color: red;">Erro ao conectar com o servidor.</p>';
    }
});