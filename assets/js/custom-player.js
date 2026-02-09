/**
 * CUSTOM-PLAYER.JS - HTML5 VIDEO PLAYER
 * Native video player with custom controls.
 * STRICTLY for HTML5 video (MP4/WebM) - NO YouTube logic.
 * 
 * Features:
 * - Custom HTML5 controls (play/pause, progress bar, volume, fullscreen)
 * - Auto-hiding controls on inactivity
 * - Loading spinner and buffering indicators
 * - Responsive design matching style.css
 */

const CustomPlayer = (() => {
    let videoEl = null;
    let videoFrame = null;
    let customControls = null;
    let controlsAutoHideTimeout = null;
    let isControlsVisible = true;

    /**
     * Initialize player with video element or selector
     * @param {HTMLVideoElement|string} videoOrSelector - Video element or CSS selector
     */
    const init = (videoOrSelector) => {
        if (typeof videoOrSelector === 'string') {
            videoEl = document.querySelector(videoOrSelector);
        } else {
            videoEl = videoOrSelector;
        }

        if (!videoEl) {
            console.error('CustomPlayer: Video element not found');
            return;
        }

        videoFrame = videoEl.closest('.video-frame');
        if (!videoFrame) {
            console.error('CustomPlayer: .video-frame container not found');
            return;
        }

        createCustomControls();
        bindVideoEvents();
        setupControlsInteractivity();

        console.log('[CustomPlayer] Initialized');
    };



    /**
     * Create custom HTML5 controls UI
     */
    const createCustomControls = () => {
        if (!videoFrame) return;

        const controlsHTML = `
            <div class="custom-controls">
                <div class="progress-container">
                    <div class="buffered-progress"></div>
                    <div class="played-progress"></div>
                    <input type="range" class="seek-bar" min="0" max="100" value="0">
                </div>
                <div class="controls-bottom">
                    <div class="controls-left">
                        <button class="control-btn play-btn" title="Play/Pause">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="volume-control">
                            <button class="control-btn volume-btn" title="Mute/Unmute">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <input type="range" class="volume-bar" min="0" max="100" value="70">
                        </div>
                        <div class="time-display">
                            <span class="current-time">0:00</span>
                            <span class="time-separator">/</span>
                            <span class="duration">0:00</span>
                        </div>
                    </div>
                    <div class="controls-right">
                        <button class="control-btn fullscreen-btn" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        videoFrame.insertAdjacentHTML('afterbegin', controlsHTML);
        customControls = videoFrame.querySelector('.custom-controls');
    };

    /**
     * Bind HTML5 video element events
     */
    const bindVideoEvents = () => {
        if (!videoEl) return;

        // Metadata loaded
        videoEl.addEventListener('loadedmetadata', () => {
            updateDuration();
        });

        // Time update
        videoEl.addEventListener('timeupdate', () => {
            updateProgress();
            updateCurrentTime();
        });

        // Play state
        videoEl.addEventListener('play', () => {
            updatePlayButton();
        });

        videoEl.addEventListener('pause', () => {
            updatePlayButton();
        });

        // Buffering
        videoEl.addEventListener('progress', () => {
            updateBufferedProgress();
        });

        // Loading states
        videoEl.addEventListener('waiting', () => {
            showLoadingSpinner();
        });

        videoEl.addEventListener('canplay', () => {
            hideLoadingSpinner();
        });

        // Volume changes
        videoEl.addEventListener('volumechange', () => {
            updateVolumeButton();
        });

        // Fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            updateFullscreenButton();
        });
    };

    /**
     * Setup controls interactivity
     */
    const setupControlsInteractivity = () => {
        const playBtn = videoFrame.querySelector('.play-btn');
        const seekBar = videoFrame.querySelector('.seek-bar');
        const volumeBtn = videoFrame.querySelector('.volume-btn');
        const volumeBar = videoFrame.querySelector('.volume-bar');
        const fullscreenBtn = videoFrame.querySelector('.fullscreen-btn');

        // Play/Pause button
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (videoEl.paused) {
                    videoEl.play();
                } else {
                    videoEl.pause();
                }
            });
        }

        // Seek bar
        if (seekBar) {
            seekBar.addEventListener('input', (e) => {
                const percent = e.target.value;
                videoEl.currentTime = (percent / 100) * videoEl.duration;
            });
        }

        // Volume button (mute/unmute)
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                videoEl.muted = !videoEl.muted;
            });
        }

        // Volume bar
        if (volumeBar) {
            volumeBar.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                videoEl.volume = volume;
                if (volume > 0) videoEl.muted = false;
            });
        }

        // Fullscreen button
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    videoFrame.requestFullscreen().catch(err => {
                        console.warn('Fullscreen request denied:', err);
                    });
                }
            });
        }

        // Controls visibility on mouse movement
        videoFrame.addEventListener('mousemove', () => {
            showControls();
        });

        videoFrame.addEventListener('mouseleave', () => {
            scheduleControlsHide();
        });

        // Prevent controls from auto-hiding during interaction
        if (customControls) {
            customControls.addEventListener('mouseenter', () => {
                clearTimeout(controlsAutoHideTimeout);
            });
            customControls.addEventListener('mouseleave', () => {
                scheduleControlsHide();
            });
        }
    };

    /**
     * Update progress bar
     */
    const updateProgress = () => {
        const playedProgress = videoFrame.querySelector('.played-progress');
        if (!playedProgress || !videoEl.duration) return;

        const percent = (videoEl.currentTime / videoEl.duration) * 100;
        playedProgress.style.width = percent + '%';

        // Update seek bar
        const seekBar = videoFrame.querySelector('.seek-bar');
        if (seekBar) {
            seekBar.value = percent;
        }
    };

    /**
     * Update buffered progress
     */
    const updateBufferedProgress = () => {
        const bufferedProgress = videoFrame.querySelector('.buffered-progress');
        if (!bufferedProgress || !videoEl.duration) return;

        if (videoEl.buffered.length > 0) {
            const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
            const percent = (bufferedEnd / videoEl.duration) * 100;
            bufferedProgress.style.width = percent + '%';
        }
    };

    /**
     * Update current time display
     */
    const updateCurrentTime = () => {
        const currentTimeEl = videoFrame.querySelector('.current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(videoEl.currentTime);
        }
    };

    /**
     * Update duration display
     */
    const updateDuration = () => {
        const durationEl = videoFrame.querySelector('.duration');
        if (durationEl) {
            durationEl.textContent = formatTime(videoEl.duration);
        }
    };

    /**
     * Update play button icon
     */
    const updatePlayButton = () => {
        const playBtn = videoFrame.querySelector('.play-btn i');
        if (playBtn) {
            playBtn.className = videoEl.paused ? 'fas fa-play' : 'fas fa-pause';
        }
    };

    /**
     * Update volume button icon
     */
    const updateVolumeButton = () => {
        const volumeBtn = videoFrame.querySelector('.volume-btn i');
        if (!volumeBtn) return;

        if (videoEl.muted || videoEl.volume === 0) {
            volumeBtn.className = 'fas fa-volume-mute';
        } else if (videoEl.volume < 0.5) {
            volumeBtn.className = 'fas fa-volume-down';
        } else {
            volumeBtn.className = 'fas fa-volume-up';
        }

        // Update volume bar
        const volumeBar = videoFrame.querySelector('.volume-bar');
        if (volumeBar) {
            volumeBar.value = videoEl.muted ? 0 : videoEl.volume * 100;
        }
    };

    /**
     * Update fullscreen button icon
     */
    const updateFullscreenButton = () => {
        const fullscreenBtn = videoFrame.querySelector('.fullscreen-btn i');
        if (fullscreenBtn) {
            fullscreenBtn.className = document.fullscreenElement
                ? 'fas fa-compress'
                : 'fas fa-expand';
        }
    };

    /**
     * Show controls
     */
    const showControls = () => {
        if (!customControls) return;
        customControls.classList.remove('hidden');
        isControlsVisible = true;
        scheduleControlsHide();
    };

    /**
     * Schedule controls to hide after inactivity
     */
    const scheduleControlsHide = () => {
        clearTimeout(controlsAutoHideTimeout);
        if (!videoEl.paused) {
            controlsAutoHideTimeout = setTimeout(() => {
                if (customControls && isControlsVisible) {
                    customControls.classList.add('hidden');
                    isControlsVisible = false;
                }
            }, 3000);
        }
    };

    /**
     * Show loading spinner
     */
    const showLoadingSpinner = () => {
        let spinner = videoFrame.querySelector('.video-spinner');
        if (!spinner) {
            const spinnerHTML = `
                <div class="video-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-text">Loading...</div>
                </div>
            `;
            videoFrame.insertAdjacentHTML('afterbegin', spinnerHTML);
            spinner = videoFrame.querySelector('.video-spinner');
        }
        spinner.classList.add('show');
    };

    /**
     * Hide loading spinner
     */
    const hideLoadingSpinner = () => {
        const spinner = videoFrame.querySelector('.video-spinner');
        if (spinner) {
            spinner.classList.remove('show');
        }
    };

    /**
     * Format time display (MM:SS)
     */
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    /**
     * Get current video element
     */
    const getVideoElement = () => videoEl;

    /**
     * Public API
     */
    return {
        init,
        getVideoElement,
        formatTime
    };
})();

/**
 * Expose to global scope
 */
window.CustomPlayer = CustomPlayer;