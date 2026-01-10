// State Variables
let animationId = null;
let container = null;
let positionX = 0;
let direction = 1; // 1 = right, -1 = left

function init() {
    if (document.getElementById('pixel-runner-container')) return;

    // 1. Create Container
    container = document.createElement('div');
    container.id = 'pixel-runner-container';

    // 2. Create the GIF Image
    const gifImage = document.createElement('img');
    gifImage.classList.add('runGIF-trans');
    // Set size to 64x64 px
    gifImage.style.width = '64px';
    gifImage.style.height = '64px';
    // Inject the GIF URL
    const gifUrl = chrome.runtime.getURL('runGIF-trans.gif');
    gifImage.src = gifUrl;

    // 3. Create Bubble
    const bubble = document.createElement('div');
    bubble.classList.add('runner-speech-bubble');
    bubble.id = 'pixel-runner-bubble';
    bubble.innerText = "Hmm...";

    // 4. Assemble
    container.appendChild(gifImage);
    container.appendChild(bubble);
    document.body.appendChild(container);

    // Reset
    positionX = 0;
    animate();
}

function remove() {
    if (animationId) cancelAnimationFrame(animationId);
    const existingContainer = document.getElementById('pixel-runner-container');
    if (existingContainer) existingContainer.remove();
    container = null;
}

function animate() {
    if (!container) return;

    const screenWidth = window.innerWidth;
    const charWidth = 64; // Match your GIF width
    const speed = 2;

    positionX += speed * direction;

    // Boundaries Check
    if (positionX >= (screenWidth - charWidth)) {
        direction = -1;
        // Flip the CONTAINER to face Left
        container.style.transform = "scaleX(-1)";
        readPageTitle();
    } else if (positionX <= 0) {
        direction = 1;
        // Flip the CONTAINER to face Right
        container.style.transform = "scaleX(1)";
    }

    container.style.left = positionX + 'px';
    animationId = requestAnimationFrame(animate);
}

function readPageTitle() {
    const bubble = document.getElementById('pixel-runner-bubble');
    if (!bubble) return;

    // Correct the text direction so it's not backwards when character is flipped
    // We apply a counter-flip to the bubble
    bubble.style.transform = "scaleX(-1)"; 

    const currentTitle = document.title.length > 20 
        ? document.title.substring(0, 20) + "..." 
        : document.title;
    
    bubble.innerText = `Reading: "${currentTitle}"`;
    bubble.classList.add('visible');

    setTimeout(() => {
        if(bubble) bubble.classList.remove('visible');
    }, 2000);
}

// Storage Listeners
chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
        changes.enabled.newValue ? init() : remove();
    }
});

chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled !== false) init();
});