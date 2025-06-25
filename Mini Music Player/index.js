class MusicPlayer {
    constructor() {
        this.currentSong = 0;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 225; // 3:45 in seconds
        this.volume = 0.7;
        this.songs = [
            { title: "Summer Vibes", artist: "Chill Beats", duration: 225, icon: "🎵" },
            { title: "Ocean Waves", artist: "Nature Sounds", duration: 180, icon: "🌊" },
            { title: "City Lights", artist: "Urban Groove", duration: 195, icon: "🌃" },
            { title: "Midnight Jazz", artist: "Smooth Collective", duration: 240, icon: "🎷" },
            { title: "Forest Dreams", artist: "Ambient Collective", duration: 200, icon: "🌲" },
            { title: "Electric Pulse", artist: "Synth Masters", duration: 210, icon: "⚡" }
        ];

        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.startProgressSimulation();
    }

    initializeElements() {
        this.albumArt = document.getElementById('albumArt');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progress = document.getElementById('progress');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.playlistItems = document.querySelectorAll('.playlist-item');
        this.playlistToggle = document.getElementById('playlistToggle');
        this.playlist = document.getElementById('playlist');
    }

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        this.playlistToggle.addEventListener('click', () => this.togglePlaylist());

        this.playlistItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const songIndex = parseInt(e.currentTarget.dataset.song);
                this.loadSong(songIndex);
            });
        });
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
            this.albumArt.classList.add('playing');
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
            this.albumArt.classList.remove('playing');
        }
    }

    previousSong() {
        this.currentSong = (this.currentSong - 1 + this.songs.length) % this.songs.length;
        this.loadSong(this.currentSong);
    }

    nextSong() {
        this.currentSong = (this.currentSong + 1) % this.songs.length;
        this.loadSong(this.currentSong);
    }

    loadSong(index) {
        this.currentSong = index;
        this.currentTime = 0;
        this.duration = this.songs[index].duration;
        this.updateDisplay();
        this.updatePlaylist();

        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
            this.albumArt.classList.add('playing');
        }
    }

    updateDisplay() {
        const song = this.songs[this.currentSong];
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        this.albumArt.textContent = song.icon;
        this.durationEl.textContent = this.formatTime(this.duration);
        this.updateProgress();
    }

    updatePlaylist() {
        this.playlistItems.forEach((item, index) => {
            if (index === this.currentSong) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    togglePlaylist() {
        this.playlist.classList.toggle('show');
        this.playlistToggle.textContent = this.playlist.classList.contains('show') ? 'Hide' : 'Playlist';
    }

    seekTo(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.currentTime = percent * this.duration;
        this.updateProgress();
    }

    setVolume(e) {
        this.volume = e.target.value / 100;
    }

    updateProgress() {
        const percent = (this.currentTime / this.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    startProgressSimulation() {
        setInterval(() => {
            if (this.isPlaying) {
                this.currentTime += 1;
                if (this.currentTime >= this.duration) {
                    this.currentTime = 0;
                    this.nextSong();
                }
                this.updateProgress();
            }
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});