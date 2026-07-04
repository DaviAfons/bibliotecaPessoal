document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarioNavbar();
    mostrarSkeletons();
    carregarFavoritos();
});

// ── Skeletons de carregamento ──────────────────────────
function mostrarSkeletons(qtd = 4) {
    const grid = document.querySelector('.favorites-grid');
    grid.innerHTML = Array.from({ length: qtd }, () => `
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-info">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        </div>
    `).join('');
}

// ── Navbar ─────────────────────────────────────────────
async function carregarUsuarioNavbar() {
    try {
        const response = await fetch('../../backend/auth/get_perfil.php');
        const data = await response.json();
        if (data.success) {
            const u = data.dados;
            const navNome = document.getElementById('navNome');
            if (navNome) navNome.textContent = u.nome.split(' ')[0];

            const avatar = document.getElementById('navAvatar');
            if (avatar) {
                avatar.src = u.foto_perfil
                    ? '../' + u.foto_perfil
                    : `https://ui-avatars.com/api/?name=${u.nome}&background=efe7dd&color=5a1a1b`;
            }
        }
    } catch (e) { console.error(e); }
}

// ── Carregar Favoritos ────────────────────────────────
async function carregarFavoritos() {
    try {
        const response = await fetch('../../backend/livros/listar.php?favoritos=1');
        const data = await response.json();
        const grid = document.querySelector('.favorites-grid');

        if (!data.success || !data.livros || data.livros.length === 0) {
            grid.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-heart"></i>
                    <h3>Você ainda não tem favoritos.</h3>
                    <p>Vá até a biblioteca e clique no coração dos seus livros preferidos!</p>
                    <a href="biblioteca.html" class="btn-back"
                       style="display:inline-flex; margin-top:24px; border-color:var(--dourado); color:var(--dourado);">
                        <i class="fas fa-arrow-right"></i>
                        <span>Ir para Biblioteca</span>
                    </a>
                </div>
            `;
            return;
        }

        grid.innerHTML = data.livros.map((livro, idx) => {
            const estrelas = Array.from({ length: 5 }, (_, i) =>
                `<i class="${i < (livro.avaliacao || 0) ? 'fas' : 'far'} fa-star"></i>`
            ).join('');

            let tagsGeneros = livro.generos_nomes
                ? livro.generos_nomes.split(',').map(g =>
                    `<span class="genre-tag">${g.trim()}</span>`
                ).join('')
                : `<span class="genre-tag">Geral</span>`;

            const imagemSrc = livro.imagem && livro.imagem.trim() !== ''
                ? livro.imagem
                : 'https://via.placeholder.com/150x220?text=Capa';

            return `
                <div class="fav-card" style="animation-delay:${0.05 + idx * 0.06}s">
                    <img src="${imagemSrc}" class="fav-capa" alt="${livro.titulo}" loading="lazy">

                    <div class="fav-info">
                        <h4>${livro.titulo}</h4>
                        <p style="font-size:0.88rem; color:#888; margin-bottom:0;">${livro.autor}</p>

                        <div class="fav-stars">${estrelas}</div>

                        <div style="margin-bottom:4px; line-height:1.6;">
                            ${tagsGeneros}
                        </div>

                        <button class="btn-heart-remove" onclick="confirmarRemocao(${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')">
                            <i class="fas fa-heart"></i>
                            <span>Remover</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) { console.error("Erro ao listar favoritos:", e); }
}

// ── Modal Glassmorphism ───────────────────────────────
function confirmarRemocao(id, titulo) {
    // Remove modal anterior se existir
    document.getElementById('fav-modal')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'fav-modal';

    overlay.innerHTML = `
        <div class="modal-glass" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h3 id="modal-title"><i class="fas fa-heart" style="color:#e04040; margin-right:10px;"></i>Remover Favorito</h3>
            <p>Deseja remover <strong style="color:var(--vinho);">${titulo}</strong> da sua coleção especial?</p>
            <div class="modal-actions">
                <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
                <button class="btn-modal-confirm" id="modal-confirm">Sim, remover</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharModal();
    });

    // Fechar com Escape
    document.addEventListener('keydown', escListener);

    document.getElementById('modal-cancel').addEventListener('click', fecharModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {
        fecharModal();
        removerFavorito(id);
    });
}

function fecharModal() {
    const overlay = document.getElementById('fav-modal');
    if (!overlay) return;
    overlay.style.animation = 'none';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.22s ease';
    setTimeout(() => overlay.remove(), 230);
    document.removeEventListener('keydown', escListener);
}

function escListener(e) {
    if (e.key === 'Escape') fecharModal();
}

// ── Remover Favorito ──────────────────────────────────
async function removerFavorito(id) {
    try {
        const response = await fetch('../../backend/livros/favoritar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        if (result.success) {
            mostrarSkeletons(3);
            carregarFavoritos();
        }
    } catch (e) { console.error(e); }
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../../index.html';
}