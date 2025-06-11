let speech = new SpeechSynthesisUtterance();
let voices = [];
let voiceSelect = document.querySelector("#voice");
let isPlaying = false;
let visualizerInterval;

window.addEventListener("load", () => {
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }
    updateCharCount();
});

function populateVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";
    
    voices.forEach((voice, index) => {
        let option = document.createElement("option");
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });
}

function speakText() {
    const textArea = document.querySelector("#text");
    const text = textArea.value.trim();
    
    if (text === "") {
        alert("Please enter some text to convert to speech!");
        return;
    }
    
    if (isPlaying) {
        speechSynthesis.cancel();
        updatePlayButton(false);
        stopVisualizer();
        return;
    }
    
    speech.text = text;
    speech.voice = voices[voiceSelect.value];
    speech.rate = document.querySelector("#rate").value;
    speech.pitch = document.querySelector("#pitch").value;
    speech.volume = document.querySelector("#volume").value;
    
    speech.onstart = () => {
        updatePlayButton(true);
        startVisualizer();
    };
    
    speech.onend = () => {
        updatePlayButton(false);
        stopVisualizer();
    };
    
    speech.onerror = () => {
        updatePlayButton(false);
        stopVisualizer();
        alert("An error occurred while speaking the text.");
    };
    
    speechSynthesis.speak(speech);
}

function pauseResume() {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        document.querySelector("#pauseBtn").textContent = "Resume";
    } else if (speechSynthesis.paused) {
        speechSynthesis.resume();
        document.querySelector("#pauseBtn").textContent = "Pause";
    }
}

function stopSpeech() {
    speechSynthesis.cancel();
    updatePlayButton(false);
    stopVisualizer();
    document.querySelector("#pauseBtn").textContent = "Pause";
}

function updatePlayButton(playing) {
    isPlaying = playing;
    const playBtn = document.querySelector("#playBtn");
    playBtn.textContent = playing ? "Stop" : "Convert To Speech";
    playBtn.classList.toggle("playing", playing);
}

// Rate display update
document.querySelector("#rate").addEventListener("input", (e) => {
    document.querySelector("#rateValue").textContent = e.target.value;
});

// Pitch display update
document.querySelector("#pitch").addEventListener("input", (e) => {
    document.querySelector("#pitchValue").textContent = e.target.value;
});

// Volume display update
document.querySelector("#volume").addEventListener("input", (e) => {
    document.querySelector("#volumeValue").textContent = e.target.value;
});

// Character counter
function updateCharCount() {
    const textArea = document.querySelector("#text");
    const charCount = document.querySelector("#charCount");
    
    textArea.addEventListener("input", () => {
        charCount.textContent = textArea.value.length;
    });
}

// Audio visualizer functions
function startVisualizer() {
    const waveBars = document.querySelectorAll(".wave-bar");
    
    visualizerInterval = setInterval(() => {
        waveBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add("active");
                setTimeout(() => {
                    bar.classList.remove("active");
                }, 400);
            }, index * 100);
        });
    }, 800);
}

function stopVisualizer() {
    if (visualizerInterval) {
        clearInterval(visualizerInterval);
        visualizerInterval = null;
    }
    
    const waveBars = document.querySelectorAll(".wave-bar");
    waveBars.forEach(bar => {
        bar.classList.remove("active");
    });
}

// Event listeners
document.querySelector("#playBtn").addEventListener("click", speakText);
document.querySelector("#pauseBtn").addEventListener("click", pauseResume);
document.querySelector("#stopBtn").addEventListener("click", stopSpeech);
