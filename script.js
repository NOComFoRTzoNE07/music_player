const gradientPairs = [
    {
        main: ['#ff6b6b', '#7f4782'],
        wave: ['#ff8f8f', '#9a6b9e']
    },
    {
        main: ['#4568DC', '#B06AB3'],
        wave: ['#6789ef', '#c88bd4']
    },
    {
        main: ['#11998e', '#38ef7d'],
        wave: ['#23aa9f', '#5ef295']
    },
    {
        main: ['#FC466B', '#3F5EFB'],
        wave: ['#fd6886', '#6179fc']
    },
    {
        main: ['#00F260', '#0575E6'],
        wave: ['#1fff75', '#2689ef']
    },
    {
        main: ['#e1eec3', '#f05053'],
        wave: ['#e9f2d4', '#f37275']
    },
    {
        main: ['#8E2DE2', '#4A00E0'],
        wave: ['#a154e9', '#6b2ee9']
    },
    {
        main: ['#FFD89B', '#19547B'],
        wave: ['#ffe1b4', '#2d6891']
    },
    {
        main: ['#FF0099', '#493240'],
        wave: ['#ff1aa6', '#614459']
    },
    {
        main: ['#1f4037', '#99f2c8'],
        wave: ['#2d5147', '#aff4d1']
    }
];

let currentGradientIndex = 0;
let isTransitioning = false;

function updateGradient() {
    const root = document.documentElement;
    const nextIndex = (currentGradientIndex + 1) % gradientPairs.length;
    
    // Set main gradient colors
    root.style.setProperty('--gradient-1', gradientPairs[currentGradientIndex].main[0]);
    root.style.setProperty('--gradient-2', gradientPairs[currentGradientIndex].main[1]);
    
    // Set wave colors
    root.style.setProperty('--wave-color-1', gradientPairs[currentGradientIndex].wave[0]);
    root.style.setProperty('--wave-color-2', gradientPairs[currentGradientIndex].wave[1]);
    
    currentGradientIndex = nextIndex;
}

function fadeTransition() {
    if (isTransitioning) return;
    
    isTransitioning = true;
    const body = document.body;
    
    // Add fade out effect
    body.style.opacity = '0.5';
    
    // After fade out, update colors and fade back in
    setTimeout(() => {
        updateGradient();
        body.style.opacity = '1';
        isTransitioning = false;
    }, 1500);
}

function initializeGradients() {
    const root = document.documentElement;
    
    // Set initial colors
    root.style.setProperty('--gradient-1', gradientPairs[0].main[0]);
    root.style.setProperty('--gradient-2', gradientPairs[0].main[1]);
    root.style.setProperty('--wave-color-1', gradientPairs[0].wave[0]);
    root.style.setProperty('--wave-color-2', gradientPairs[0].wave[1]);
    
    // Change gradient every 5 seconds with fade effect
    setInterval(fadeTransition, 5000);
}

const songs = [
    {
        title: "Jab Tak",
        artist: "Armaan Malik",
        src: "./music/Jab Tak.mp3"
    },
    {
        title: "Pehela Pyaar",
        artist: "Armaan Malik",
        src: "./music/Pehela Pyaar.mp3"
    },
    {
        title: "Sab Tera",
        artist: "Armaan Malik",
        src: "./music/Sab Tera.mp3"
    }
];

const scenes = [
    { type: 'sunset', url: 'url(sunset.jpg)' },
    { type: 'beach', url: 'url(beach.jpg)' },
    { type: 'night-sky', url: 'url(night-sky.jpg)' },
    { type: 'lake', url: 'url(lake.jpg)' },
    { type: 'nature', url: 'url(nature.jpg)' }
];

let currentSongIndex = 0;
let isPlaying = false;
let currentScene = 0;
let audioContext = null;
let analyser = null;
let dataArray = null;

const audio = new Audio();
audio.volume = 1.0;

// DOM Elements
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeSlider = document.getElementById('volume');
const songTitle = document.querySelector('.song-title');
const songArtist = document.querySelector('.song-artist');
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.querySelector('.current-time');
const durationEl = document.querySelector('.duration');

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function initAudio() {
    if (audioContext) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function updateVisualization() {
    if (!analyser) return;
    
    analyser.getByteFrequencyData(dataArray);
    const bars = document.querySelectorAll('.bar');
    
    bars.forEach((bar, index) => {
        const value = dataArray[index];
        const height = (value / 255) * 100;
        bar.style.height = `${height}%`;
    });

    requestAnimationFrame(updateVisualization);
}

function changeScene() {
    currentScene = (currentScene + 1) % scenes.length;
    const background = document.querySelector('.background-animation');
    background.style.backgroundImage = scenes[currentScene].url;
}

function loadSong(index) {
    const song = songs[index];
    audio.src = song.src;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    
    // Pre-load the audio
    audio.load();
}

playBtn.addEventListener('click', () => {
    if (!audioContext) {
        initAudio();
    }
    
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        // Resume AudioContext if it was suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        audio.play().catch(error => {
            console.error("Audio playback error:", error);
        });
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        updateVisualization();
    }
    isPlaying = !isPlaying;
});

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        audio.play().catch(error => {
            console.error("Audio playback error:", error);
        });
    }
});

nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        audio.play().catch(error => {
            console.error("Audio playback error:", error);
        });
    }
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
});

progressBar.addEventListener('click', (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
});

audio.addEventListener('timeupdate', () => {
    const currentTime = Math.floor(audio.currentTime);
    const duration = Math.floor(audio.duration);
    
    // Update progress bar
    if (!isNaN(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
});

audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    alert('Error loading audio file. Please check if the file exists and is in the correct format.');
});

// Add keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            playBtn.click();
            break;
        case 'ArrowLeft':
            audio.currentTime -= 5;
            break;
        case 'ArrowRight':
            audio.currentTime += 5;
            break;
        case 'ArrowUp':
            audio.volume = Math.min(1, audio.volume + 0.1);
            volumeSlider.value = audio.volume * 100;
            break;
        case 'ArrowDown':
            audio.volume = Math.max(0, audio.volume - 0.1);
            volumeSlider.value = audio.volume * 100;
            break;
    }
});

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGradients();
    loadSong(currentSongIndex);
    
    // Add console log to check if audio files are loading
    console.log('Current audio source:', audio.src);
});

// Example lyrics feature
const lyrics = {
    "song1.mp3": [
        { time: 0, text: "First line of lyrics" },
        { time: 5, text: "Second line of lyrics" },
        // ... more lyrics with timestamps
    ]
};

function updateLyrics(currentTime) {
    const currentSong = songs[currentSongIndex];
    const songLyrics = lyrics[currentSong.src];
    if (songLyrics) {
        const currentLyric = songLyrics.find(lyric => 
            lyric.time <= currentTime && 
            (!songLyrics[songLyrics.indexOf(lyric) + 1] || 
             songLyrics[songLyrics.indexOf(lyric) + 1].time > currentTime)
        );
        if (currentLyric) {
            document.querySelector('.lyrics').textContent = currentLyric.text;
        }
    }
}

// Add particle effect
function createParticles() {
    const container = document.querySelector('.player-container');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle floating';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(particle);
    }
}

// Add active class to bars based on frequency
function updateBars() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        if (dataArray[index] > 150) { // Threshold for "active" state
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });
}

// Add rotating animation to play button
playBtn.addEventListener('click', () => {
    playBtn.classList.toggle('playing');
});

// Add number rolling animation to time display
function updateTimeWithAnimation() {
    currentTimeEl.classList.add('updating');
    setTimeout(() => {
        currentTimeEl.classList.remove('updating');
    }, 300);
}
