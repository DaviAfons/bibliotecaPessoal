document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarioNavbar();
    carregarFavoritos();
});

// 1. Carregar Navbar (Foto e Nome)
async function carregarUsuarioNavbar() {
    try {
        const response = await fetch('../../backend/auth/get_perfil.php');
        const data = await response.json();
        if (data.success) {
            const u = data.dados;
            const navNome = document.getElementById('navNome');
            if(navNome) navNome.textContent = u.nome.split(' ')[0];
            
            const avatar = document.getElementById('navAvatar');
            if(avatar) {
                if (u.foto_perfil) {
                    avatar.src = '../' + u.foto_perfil;
                } else {
                    avatar.src = `https://ui-avatars.com/api/?name=${u.nome}&background=efe7dd&color=5a1a1b`;
                }
            }
        }
    } catch (e) { console.error(e); }
}

// 2. Carregar Livros Favoritos
async function carregarFavoritos() {
    try {
        // Chama o listar com o filtro ativado
        const response = await fetch('../../backend/livros/listar.php?favoritos=1');
        const data = await response.json();
        const grid = document.querySelector('.favorites-grid');

        if (!data.success || !data.livros || data.livros.length === 0) {
            grid.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-heart"></i>
                    <h3>Você ainda não tem favoritos.</h3>
                    <p style="color: #666; margin-top: 10px;">Vá até a biblioteca e clique no coração dos seus livros preferidos!</p>
                    <a href="biblioteca.html" class="btn-back" style="display:inline-flex; margin-top:20px; border-color:var(--dourado); color:var(--dourado);">
                        Ir para Biblioteca
                    </a>
                </div>
            `;
            return;
        }

        // Renderiza os Cards
        grid.innerHTML = data.livros.map(livro => {
            // Gera estrelas douradas
            const estrelas = Array.from({ length: 5 }, (_, i) => 
                `<i class="${i < (livro.avaliacao || 0) ? 'fas' : 'far'} fa-star"></i>`
            ).join('');

            // --- CORREÇÃO AQUI: Gera tags para TODOS os géneros ---
            let tagsGeneros = '';
            
            if (livro.generos_nomes) {
                // Divide a string, remove espaços extras com trim() e cria um span para cada
                tagsGeneros = livro.generos_nomes.split(',').map(genero => 
                    `<span class="genre-tag" style="background:var(--bege-claro); color:var(--vinho); font-size:0.75rem; padding:4px 8px; border-radius:4px; margin-right: 5px; display:inline-block; margin-bottom: 2px;">
                        ${genero.trim()}
                    </span>`
                ).join('');
            } else {
                tagsGeneros = `<span class="genre-tag" style="background:var(--bege-claro); color:var(--vinho); font-size:0.75rem; padding:4px 8px; border-radius:4px;">Geral</span>`;
            }

            // Se a imagem não existir, usa placeholder
            const imagemSrc = livro.imagem && livro.imagem.trim() !== '' 
                ? livro.imagem 
                : 'https://via.placeholder.com/150x220?text=Capa';

            return `
                <div class="fav-card">
                    <img src="${imagemSrc}" class="fav-capa" alt="${livro.titulo}">
                    
                    <div class="fav-info">
                        <h4>${livro.titulo}</h4>
                        <p style="font-size:0.9rem; color:#666;">${livro.autor}</p>
                        
                        <div style="color:var(--dourado); margin: 8px 0; font-size:0.9rem;">
                            ${estrelas}
                        </div>

                        <div style="margin-bottom: 10px; line-height: 1.4;">
                            ${tagsGeneros}
                        </div>

                        <div class="fav-actions" style="margin-top: auto;">
                            <button class="btn-heart-remove" onclick="removerFavorito(${livro.id})" title="Remover dos favoritos">
                                <i class="fas fa-heart"></i> Remover
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) { console.error("Erro ao listar favoritos", e); }
}

// 3. Função para Remover Favorito
async function removerFavorito(id) {
    if(!confirm("Remover este livro dos favoritos?")) return;

    try {
        const response = await fetch('../../backend/livros/favoritar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();
        
        if(result.success) {
            carregarFavoritos();
        }
    } catch (e) { console.error(e); }
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../../index.html';
}