document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggleBtn');
    const distanceEl = document.getElementById('distanceVal');
    const moodEl = document.getElementById('moodVal');

    // --- 1. Load Stats ---
    // Load Distance (From Local Storage)
    chrome.storage.local.get(['pixelRunnerDistance'], (result) => {
        const pixels = result.pixelRunnerDistance || 0;
        distanceEl.textContent = formatDistance(pixels);
    });

    // Set Random Mood
    const moods = ['Happy', 'Gloomy', 'Fuming', 'Curious', 'Sleepy', 'Hyper'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    moodEl.textContent = randomMood;
    
    // Mood Color Styling
    if (randomMood === 'Fuming') moodEl.style.color = '#ff6b6b';
    if (randomMood === 'Gloomy') moodEl.style.color = '#a8a8a8';
    if (randomMood === 'Happy') moodEl.style.color = '#ffe66d';

    // --- 2. Load Toggle State ---
    chrome.storage.sync.get(['enabled'], (result) => {
        const isEnabled = result.enabled !== false; 
        updateButton(isEnabled);
    });

    // --- 3. Handle Click ---
    btn.addEventListener('click', () => {
        chrome.storage.sync.get(['enabled'], (result) => {
            const currentState = result.enabled !== false;
            const newState = !currentState;
            
            chrome.storage.sync.set({ enabled: newState }, () => {
                updateButton(newState);
            });
        });
    });

    function updateButton(isOn) {
        if (isOn) {
            btn.textContent = "Disable Character";
            btn.className = "active";
        } else {
            btn.textContent = "Enable Character";
            btn.className = "";
        }
    }

    function formatDistance(pixels) {
        // Approx 100 pixels = 1 meter for fun
        const meters = Math.floor(pixels / 100);
        if (meters > 1000) {
            return (meters / 1000).toFixed(1) + "km";
        }
        return meters + "m";
    }
});