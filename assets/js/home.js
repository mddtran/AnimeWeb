document.addEventListener('DOMContentLoaded', () => {
    renderBanners();
    loadHomeData();
});

function renderBanners() {
    const container = document.getElementById('banner-section');
    if (!container || !window.banners) return;

    container.innerHTML = window.banners.map(b => {
        let action = '';
        if (b.type === 'anime') action = `onclick="openDetailById('${b.id}')"`;
        else if (b.type === 'watch') action = `onclick="openWatchBy('${b.id}', '${b.fid}')"`;
        else if (b.type === 'link') action = `onclick="window.open('${b.link}', '_blank')"`;
        if (b.type === 'anime' || b.type === 'watch' || b.type === 'link') {
            return `<div class="hero-banner" style="background-image: url('${b.img}')" ${action}><div class="hero-content"><div class="hero-title">${b.title}</div><div class="hero-desc">${b.desc}</div></div></div>`;
        } else if (b.type === 'notification') {
            return `<div class="notification-banner ${b.style || 'info'}"><i class="material-icons">${b.style === 'warning' ? 'warning' : 'info'}</i><span>${b.content}</span></div>`;
        } else if (b.type === 'html') {
            return b.content;
        }
    }).join('');
}

async function loadHomeData() {
    const grid = document.getElementById('grid-home');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#aaa; margin-top:50px;">Loading anime catalog...</div>';
    
    const catalog = await window.AnimeAPI.fetchCatalog();
    
    if (!catalog || catalog.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red;">No anime available.</div>';
        return;
    }
    
    grid.innerHTML = catalog.map(anime => `
        <article class="glass-panel movie-card" onclick="openDetailById('${anime.id}')">
            <img src="${anime.thumbnail}" loading="lazy" alt="${anime.title}">
            <div class="card-overlay">
                <div class="movie-title">${anime.title}</div>
            </div>
        </article>
    `).join('');
}