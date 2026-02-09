let currentAnimeId = null;

window.goToAnimeDetail = (animeId) => {
    if (animeId) openDetailById(animeId);
};

/**
 * Detect video source type from URL
 * @param {string} url - Video URL or ID
 * @returns {string} - 'youtube' or 'native'
 */
const detectSourceType = (url) => {
    if (!url) return 'native';
    const urlStr = String(url).toLowerCase();
    if (urlStr.includes('youtube.com') || urlStr.includes('youtu.be')) {
        return 'youtube';
    }
    return 'native';
};

document.addEventListener('DOMContentLoaded', async () => {
    const aid = getParam('aid');
    const fid = getParam('fid') || getParam('id');

    if (!fid) {
        routeHome();
        return;
    }

    currentAnimeId = aid;

    if (aid && (!window.animeDB || window.animeDB.length === 0)) {
        if (window.AnimeAPI) {
            await window.AnimeAPI.fetchCatalog();
        }
    }

    const anime = (aid && window.animeDB) ? window.animeDB.find(a => a.id === aid) : null;
    let currentEpisode = null;

    if (anime) {
        if (!anime.eps || anime.eps.length === 0) {
            anime.eps = await window.AnimeAPI.fetchEpisodes(aid);
        }
        currentEpisode = anime.eps ? anime.eps.find(e => e.fid === fid) : null;
        
        setupAnimeInterface(anime, aid, fid, currentEpisode);
    } else {
        hideSeriesInterface();
    }

    const sourceType = currentEpisode && currentEpisode.sourceType 
        ? currentEpisode.sourceType 
        : detectSourceType(fid);

    console.log(`[Watch] Source Type: ${sourceType} | URL: ${fid}`);

    loadVideoSource(fid, sourceType);
    setupPlayerControls();
});


function setupAnimeInterface(anime, aid, fid, ep) {
    const breadcrumbTitle = document.getElementById('w-bread-title');
    if (breadcrumbTitle) {
        breadcrumbTitle.innerText = anime.title;
        breadcrumbTitle.onclick = () => window.goToAnimeDetail(aid);
    }
    const breadEp = document.getElementById('w-bread-ep');
    if (breadEp) breadEp.innerText = ep ? ep.name : 'Đang phát';

    renderPlaylist(anime, fid);
    setupNavControls(anime, fid);

    const playerLayout = document.querySelector('.player-layout');
    const playerWrap = document.querySelector('.player-wrapper');
    const sidebar = document.querySelector('.playlist-sidebar');
    const epList = document.getElementById('w-ep-list');

    if (playerLayout) {
        playerLayout.style.display = 'flex';
        playerLayout.style.flexDirection = 'column';
        playerLayout.style.alignItems = 'center';
        playerLayout.style.gap = '20px';
    }

    if (playerWrap) {
        playerWrap.style.width = '100%';
        playerWrap.style.maxWidth = '1050px';
        playerWrap.style.flex = 'none';
    }

    if (sidebar) {
        sidebar.style.width = '100%';
        sidebar.style.maxWidth = '1050px';
        sidebar.style.height = 'auto';
        sidebar.style.maxHeight = 'none';
        sidebar.style.overflow = 'visible';
    }

    if (epList) {
        epList.style.display = 'grid';
        epList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
        epList.style.gap = '10px';
        epList.style.maxHeight = '300px';
        epList.style.overflowY = 'auto';
        epList.style.paddingRight = '5px';
    }
}

function hideSeriesInterface() {
    const elementsToHide = ['.breadcrumbs', '.playlist-sidebar'];
    elementsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
    });
    

    const playerLayout = document.querySelector('.player-layout');
    const playerWrap = document.querySelector('.player-wrapper');

    if (playerLayout) {
        playerLayout.style.display = 'flex';
        playerLayout.style.justifyContent = 'center';
    }

    if (playerWrap) {
        playerWrap.style.width = '100%'; 
        playerWrap.style.maxWidth = '1050px'; 
        playerWrap.style.margin = '0 auto';
        playerWrap.style.flex = 'none';
    }
}

const getYoutubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Load video source based on type
 * @param {string} url - Video URL or YouTube URL/ID
 * @param {string} sourceType - 'youtube' or 'native'
 */
const loadVideoSource = (url, sourceType = 'native') => {
    const frame = document.querySelector('.video-frame');
    if (!frame) return;

    frame.innerHTML = '';

    if (sourceType === 'youtube' || sourceType === 'youtube-playlist') {
        renderYouTubePlayer(frame, url, sourceType);
    } else {
        renderNativePlayer(frame, url);
    }
};

/**
 * Render YouTube iframe embed
 */
const renderYouTubePlayer = (container, url, sourceType) => {
    container.classList.add('is-youtube');
    
    let embedUrl;
    
    if (sourceType === 'youtube-playlist') {
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${url}&autoplay=0&modestbranding=1&rel=0`;
    } else {
        const ytId = getYoutubeID(url);
        if (!ytId) {
            container.innerHTML = '<div style="color:white; display:flex; justify-content:center; align-items:center; height:100%; font-size:16px;">Invalid YouTube URL</div>';
            return;
        }
        embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    }
    
    container.innerHTML = `
        <iframe 
            id="video-player" 
            src="${embedUrl}" 
            frameborder="0" 
            allowfullscreen 
            allow="autoplay; encrypted-media; picture-in-picture"
            style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;">
        </iframe>`;
};

/**
 * Render native HTML5 video player
 */
const renderNativePlayer = (container, url) => {
    container.classList.remove('is-youtube');
    
    const videoEl = document.createElement('video');
    videoEl.id = 'video';
    videoEl.src = url;
    videoEl.setAttribute('playsinline', '');
    
    container.appendChild(videoEl);
    
    if (window.CustomPlayer && window.CustomPlayer.init) {
        setTimeout(() => {
            window.CustomPlayer.init('#video');
        }, 100);
    }
};

function renderPlaylist(anime, currentFid) {
    const listEl = document.getElementById('w-ep-list');
    if (!listEl || !anime.eps) return;
    listEl.innerHTML = anime.eps.map(e =>
        `<button class="ep-btn ${e.fid === currentFid ? 'active' : ''}"
            onclick="openWatchBy('${anime.id}','${e.fid}')">
            ${e.name}
        </button>`
    ).join('');
}

function setupNavControls(anime, currentFid) {
    if (!anime.eps) return;
    const idx = anime.eps.findIndex(e => e.fid === currentFid);
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) {
        btnPrev.onclick = () => { if (idx > 0) openWatchBy(anime.id, anime.eps[idx - 1].fid); };
        btnPrev.classList.toggle('disabled', idx <= 0);
    }
    if (btnNext) {
        btnNext.onclick = () => { if (idx < anime.eps.length - 1) openWatchBy(anime.id, anime.eps[idx + 1].fid); };
        btnNext.classList.toggle('disabled', idx >= anime.eps.length - 1);
    }
}

function setupPlayerControls() {
    setupLightControl();
    setupTheaterControl();
    setupFitControl();
}

function setupLightControl() {
    const btnLight = document.getElementById('btn-light');
    if (btnLight) {
        btnLight.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            window.toggleLight();
        };
    }
}

function setupTheaterControl() {
    const btnTheater = document.getElementById('btn-theater');
    if (btnTheater) {
        btnTheater.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            const player = document.querySelector('.player-wrapper');
            const overlay = document.getElementById('theater-overlay');
            if (!player) return;
            const isTheater = player.classList.toggle('theater');
            if (overlay) overlay.classList.toggle('active', isTheater);
            btnTheater.innerHTML = isTheater ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
            document.body.style.overflow = isTheater ? 'hidden' : '';
        };
    }
}

function setupFitControl() {
    const btnFit = document.getElementById('btn-fit');
    if (btnFit) {
        window.fitMode = 0;
        btnFit.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            const video = document.getElementById('video');
            const frame = document.querySelector('.video-frame');
            if (!frame) return;
            
            const fitModes = ['contain', 'cover', 'fill'];
            const fitIcons = ['fa-compress', 'fa-search-plus', 'fa-arrows-alt'];
            
            window.fitMode = (window.fitMode + 1) % fitModes.length;
            const currentMode = fitModes[window.fitMode];
            const isYoutube = frame.classList.contains('is-youtube');
            const player = isYoutube ? frame.querySelector('iframe') : video;
            
            if (!player) return;

            if (isYoutube) {
                player.style.objectFit = '';
                player.style.transform = (currentMode === 'cover') ? 'scale(1.35)' : 
                                         (currentMode === 'fill') ? 'scale(1.2, 1)' : 'scale(1)';
            } else {
                player.style.transform = '';
                player.style.objectFit = currentMode;
            }
            btnFit.innerHTML = `<i class="fas ${fitIcons[window.fitMode]}"></i>`;
        };
    }
}