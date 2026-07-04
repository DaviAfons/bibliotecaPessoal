/* ==================================================
   ESTATISTICAS.JS
   ================================================== */

document.addEventListener('DOMContentLoaded', () => {
    inicializar();

    document.getElementById('navbarToggle')?.addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('active');
    });

    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../../index.html';
    });
});

async function inicializar() {
    await Promise.all([
        carregarNavbar(),
        carregarEstatisticas()
    ]);
}

// ── Navbar ────────────────────────────────────────────────────────────────────
async function carregarNavbar() {
    try {
        const res  = await fetch('../../backend/auth/get_perfil.php');
        const data = await res.json();
        if (!data.success) return;

        const u = data.dados;
        const navNome   = document.getElementById('navNome');
        const navAvatar = document.getElementById('navAvatar');

        if (navNome)   navNome.textContent = u.nome.split(' ')[0];
        if (navAvatar) {
            navAvatar.src = u.foto_perfil
                ? '../' + u.foto_perfil
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=efe7dd&color=5a1a1b`;
        }
    } catch (e) { console.error('navbar:', e); }
}

// ── Dados principais ──────────────────────────────────────────────────────────
async function carregarEstatisticas() {
    try {
        const res  = await fetch('../../backend/livros/estatisticas_graficos.php');
        const data = await res.json();

        if (!data.success) {
            console.error('Endpoint retornou erro:', data.message);
            return;
        }

        renderSummary(data.status);
        renderDonut(data.status);
        renderBarras(data.generos);
        renderAvaliacoes(data.avaliacoes);

    } catch (e) { console.error('estatísticas:', e); }
}

// ── 1. Summary cards ──────────────────────────────────────────────────────────
function renderSummary(s) {
    const cards = {
        'sc-total': s.total   || 0,
        'sc-lidos': s.lidos   || 0,
        'sc-lendo': s.lendo   || 0,
        'sc-fila':  s.nao_lidos || 0,
    };

    Object.entries(cards).forEach(([id, val], i) => {
        const card = document.getElementById(id);
        if (!card) return;
        card.classList.remove('skeleton');

        const numEl = card.querySelector('.sc-num');
        if (numEl) {
            numEl.style.animationDelay = `${i * 0.08}s`;
            animateCount(numEl, val);
        }
    });
}

function animateCount(el, target) {
    const duration = 600;
    const start    = performance.now();
    const update   = (now) => {
        const t   = Math.min((now - start) / duration, 1);
        const val = Math.round(easeOut(t) * target);
        el.textContent = val;
        if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ── 2. Donut ─────────────────────────────────────────────────────────────────
function renderDonut(s) {
    const total    = parseInt(s.total)    || 0;
    const lidos    = parseInt(s.lidos)    || 0;
    const lendo    = parseInt(s.lendo)    || 0;
    const naoLidos = parseInt(s.nao_lidos) || 0;

    const circum = 452.39; // 2 * π * 72
    const gap    = 6;      // espaço entre segmentos em px de arco

    document.getElementById('donutCenter').textContent = total;

    const segments = [
        { id: 'segLido',    val: lidos,    label: 'Lidos',    color: 'var(--vinho)'       },
        { id: 'segLendo',   val: lendo,    label: 'Lendo',    color: 'var(--dourado)'     },
        { id: 'segNaoLido', val: naoLidos, label: 'Na fila',  color: 'var(--bege-escuro)' },
    ];

    let offset = 0;

    segments.forEach(seg => {
        const el   = document.getElementById(seg.id);
        if (!el) return;

        const frac = total > 0 ? seg.val / total : 0;
        const dash = frac * circum - (total > 0 && seg.val > 0 ? gap : 0);

        el.style.strokeDasharray  = `${Math.max(dash, 0)} ${circum}`;
        el.style.strokeDashoffset = -offset;

        offset += frac * circum;
    });

    // Legenda
    const legend = document.getElementById('donutLegend');
    legend.innerHTML = segments.map((seg, i) => `
        <div class="legend-item" style="animation-delay:${0.3 + i * 0.1}s">
            <div class="legend-dot" style="background:${seg.color}"></div>
            <span class="legend-label">${seg.label}</span>
            <span class="legend-val">${seg.val}</span>
        </div>
    `).join('');
}

// ── 3. Barras — gêneros ───────────────────────────────────────────────────────
function renderBarras(generos) {
    const wrapper = document.getElementById('barsWrapper');

    if (!generos || generos.length === 0) {
        wrapper.innerHTML = emptyState('fa-layer-group', 'Nenhum gênero cadastrado ainda.');
        return;
    }

    const max = Math.max(...generos.map(g => parseInt(g.total)));

    wrapper.innerHTML = generos.map((g, i) => {
        const pct = max > 0 ? (parseInt(g.total) / max) * 100 : 0;
        return `
            <div class="bar-row" style="animation-delay:${0.05 + i * 0.07}s">
                <span class="bar-label" title="${g.nome}">${g.nome}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="--bar-w:${pct.toFixed(1)}%"></div>
                </div>
                <span class="bar-val">${g.total}</span>
            </div>
        `;
    }).join('');
}

// ── 4. Barras — avaliação média por gênero ────────────────────────────────────
function renderAvaliacoes(avaliacoes) {
    const wrapper = document.getElementById('avalWrapper');

    if (!avaliacoes || avaliacoes.length === 0) {
        wrapper.innerHTML = emptyState('fa-star', 'Nenhum livro avaliado ainda.');
        return;
    }

    // Máximo é 5 estrelas
    wrapper.innerHTML = avaliacoes.map((a, i) => {
        const pct    = (parseFloat(a.media) / 5) * 100;
        const stars  = renderStars(parseFloat(a.media));
        return `
            <div class="aval-row" style="animation-delay:${0.05 + i * 0.07}s">
                <span class="aval-label" title="${a.nome}">${a.nome}</span>
                <div class="aval-track">
                    <div class="aval-fill" style="--aval-w:${pct.toFixed(1)}%"></div>
                </div>
                <div class="aval-stars">
                    ${stars}
                    <span>${a.media}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderStars(media) {
    return Array.from({ length: 5 }, (_, i) => {
        if (i < Math.floor(media))    return '<i class="fas fa-star"></i>';
        if (i < Math.ceil(media))     return '<i class="fas fa-star-half-alt"></i>';
        return '<i class="far fa-star"></i>';
    }).join('');
}

function emptyState(icon, msg) {
    return `
        <div class="empty-chart">
            <i class="fas ${icon}"></i>
            ${msg}
        </div>
    `;
}