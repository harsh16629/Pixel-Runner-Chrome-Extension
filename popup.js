document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggleBtn');

    // 1. Load saved state
    chrome.storage.sync.get(['enabled'], (result) => {
        // Default to true if not set
        const isEnabled = result.enabled !== false; 
        updateButton(isEnabled);
    });

    // 2. Handle Click
    btn.addEventListener('click', () => {
        chrome.storage.sync.get(['enabled'], (result) => {
            const currentState = result.enabled !== false;
            const newState = !currentState;
            
            // Save new state
            chrome.storage.sync.set({ enabled: newState }, () => {
                updateButton(newState);
            });
        });
    });

    function updateButton(isOn) {
        btn.textContent = isOn ? "Turn Off" : "Turn On";
        btn.className = isOn ? "active" : "";
    }
});