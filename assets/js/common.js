/**
 * COMMON.JS - UTILITY FUNCTIONS
 * Shared utilities for static GitHub Pages site.
 * All routing uses relative paths (no leading slashes).
 */

/**
 * Parse URL query parameters
 * Usage: getParam('id') extracts from ?id=123
 */
window.getParam = (key) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
};

/**
 * Get all query parameters as object
 * Usage: getAllParams() returns { id: '123', name: 'value' }
 */
window.getAllParams = () => {
    const params = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
        params[key] = value;
    });
    return params;
};

/**
 * Navigation routes - supports both root and subdirectory paths
 * Automatically detects current location and uses appropriate relative paths
 */

/**
 * Check if currently in a subdirectory (detail/ or watch/)
 */
const isInSubdirectory = () => {
    return window.location.pathname.includes('/detail/') || window.location.pathname.includes('/watch/');
};

window.routeHome = () => {
    window.location.href = isInSubdirectory() ? '../' : './';
};

window.openDetailById = (aid) => {
    const path = isInSubdirectory() ? '../detail/' : 'detail/';
    window.location.href = `${path}?aid=${encodeURIComponent(aid)}`;
};

window.openWatchBy = (aid, fid) => {
    const path = isInSubdirectory() ? '../watch/' : 'watch/';
    window.location.href = `${path}?aid=${encodeURIComponent(aid)}&fid=${encodeURIComponent(fid)}`;
};

window.goBack = () => history.back();

/**
 * Debounce utility for search and event handlers
 */
window.debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * Light mode / Focus mode toggle
 */
let lightElements = null;

window.toggleLight = () => {
    if (!lightElements) {
        lightElements = {
            overlay: document.getElementById('focus-overlay'),
            box: document.querySelector('.player-wrapper'),
            btn: document.getElementById('btn-light')
        };
    }
    
    const { overlay, box, btn } = lightElements;
    if (!overlay) return;
    
    const isActive = overlay.classList.toggle('active');
    if (box) box.classList.toggle('focus-mode', isActive);
    
    if (btn) {
        btn.style.color = isActive ? '#fff' : '#ffd700';
    }
};

/**
 * Live search implementation
 * Filters anime database by title
 */
window.searchLive = (val) => {
    const res = document.getElementById('s-result');
    if (!res) return;
    
    if (!val || !val.trim()) { 
        res.classList.remove('active'); 
        res.innerHTML = ''; 
        return; 
    }
    
    // Ensure database is loaded
    if (!window.animeDB) {
        if (window.AnimeAPI) window.AnimeAPI.fetchCatalog();
        return;
    }

    const hits = window.animeDB.filter(a => 
        a.title.toLowerCase().includes(val.toLowerCase())
    );
    
    if (hits.length > 0) {
        res.innerHTML = hits.map(a => `
            <div class="search-item" onclick="openDetailById('${a.id}'); document.getElementById('s-result').classList.remove('active');">
                <img src="${window.AnimeAPI ? window.AnimeAPI.getImageUrl(a.id) : a.thumbnail}" alt="${a.title}">
                <div>
                    <div style="font-weight:700; color:white;">${a.title}</div>
                    <span style="color:var(--text-muted); font-size:12px;">Anime Series</span>
                </div>
            </div>
        `).join('');
        res.classList.add('active');
    } else {
        res.innerHTML = '<div style="padding:15px; color:#aaa; text-align:center;">No anime found...</div>';
        res.classList.add('active');
    }
};

/**
 * Initialize search input when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('s-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', window.debounce((e) => window.searchLive(e.target.value), 300));
    }

    document.addEventListener('click', e => {
        if (!e.target.closest('.search-wrapper')) {
            const res = document.getElementById('s-result');
            if (res) res.classList.remove('active');
        }
    });
});