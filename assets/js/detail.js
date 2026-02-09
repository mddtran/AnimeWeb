let currAnime = null;

document.addEventListener('DOMContentLoaded', async () => {
    const aid = getParam('aid');
    
    if (!aid) { 
        alert('Anime ID not found. Returning to home page.');
        routeHome(); 
        return; 
    }

    if (!window.animeDB || window.animeDB.length === 0) {
        await window.AnimeAPI.fetchCatalog();
    }

    const anime = window.animeDB ? window.animeDB.find(a => a.id === aid) : null;
    
    if (!anime) { 
        document.querySelector('main').innerHTML = `
            <div class="container" style="text-align:center; padding-top:50px;">
                <h2>404 - Anime Not Found</h2>
                <p>Anime ID "${aid}" does not exist.</p>
                <button onclick="routeHome()" style="padding:10px 20px; margin-top:10px; cursor:pointer; border-radius:8px; background:#00d2ff; border:none; color:#000; font-weight:600; cursor:pointer;">Return Home</button>
            </div>
        `;
        return; 
    }
    
    currAnime = anime;
    renderAnimeDetails(anime);
    await loadEpisodeList(anime);
    setupPlayButton(anime);
});

function renderAnimeDetails(anime) {
    const posterEl = document.getElementById('d-img');
    const bgEl = document.getElementById('d-bg');
    const titleEl = document.getElementById('d-title');
    const descEl = document.getElementById('d-desc');

    if (posterEl) posterEl.src = anime.thumbnail;
    if (bgEl) bgEl.style.backgroundImage = `url('${anime.thumbnail}')`;
    if (titleEl) titleEl.innerText = anime.title;
    if (descEl) descEl.innerText = anime.description;
}

async function loadEpisodeList(anime) {
    const list = document.getElementById('d-ep-list');
    if (!list) return;
    
    list.innerHTML = '<p style="color:#888;">Loading episodes...</p>';

    const episodes = await window.AnimeAPI.fetchEpisodes(anime.id);

    if (!episodes || episodes.length === 0) {
        list.innerHTML = '<p style="color:#999;">No episodes available.</p>';
        return;
    }

    list.innerHTML = episodes.map(ep => 
        `<button class="ep-btn" onclick="openWatchBy('${anime.id}','${ep.fid}')">${ep.name}</button>`
    ).join('');
}

function setupPlayButton(anime) {
    const playBtn = document.getElementById('play-btn');
    if (!playBtn) return;

    playBtn.onclick = async () => {
        const episodes = await window.AnimeAPI.fetchEpisodes(anime.id);
        
        if (episodes && episodes.length > 0) {
            openWatchBy(anime.id, episodes[0].fid);
        } else {
            alert('No episodes available for this anime.');
        }
    };
}