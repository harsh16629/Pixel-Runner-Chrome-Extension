// --- CONFIGURATION ---
const ASSETS = {
    run: chrome.runtime.getURL('running-standard.gif'),
    stand: chrome.runtime.getURL('standing-old.png'),
    jump: chrome.runtime.getURL('jumping-old.gif'),
    midair: chrome.runtime.getURL('midair-old.png'),
    land: chrome.runtime.getURL('land-old.png') // New Asset
};

// --- STATE VARIABLES ---
let container = null;
let imgElement = null;
let animationId = null;

let positionX = 0;
let direction = 1; 
let isRunning = false;
let wallHits = 0;
let onBottom = false;

// --- INIT ---
function init() {
    if (document.getElementById('pixel-runner-container')) return;

    container = document.createElement('div');
    container.id = 'pixel-runner-container';

    imgElement = document.createElement('img');
    imgElement.classList.add('runner-gif');
    imgElement.src = ASSETS.run;

    const bubble = document.createElement('div');
    bubble.classList.add('runner-speech-bubble');
    bubble.id = 'pixel-runner-bubble';
    bubble.innerText = "Hmm...";

    container.appendChild(imgElement);
    container.appendChild(bubble);
    document.body.appendChild(container);

    positionX = 0;
    wallHits = 0;
    onBottom = false;
    isRunning = true;
    animate();
}

function remove() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (container) container.remove();
    container = null;
}

// --- MAIN LOOP ---
function animate() {
    if (!isRunning || !container) return;

    const screenWidth = window.innerWidth;
    const charWidth = 64;
    const speed = 3;

    positionX += speed * direction;

    if (positionX >= (screenWidth - charWidth)) {
        direction = -1;
        container.style.transform = "scaleX(-1)";
        handleWallHit();
    } else if (positionX <= 0) {
        direction = 1;
        container.style.transform = "scaleX(1)";
        handleWallHit();
    }

    container.style.left = positionX + 'px';
    
    if (isRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

function handleWallHit() {
    if (onBottom) return; 
    wallHits++;
    
    // Stop after 2 wall hits (approx 1 full lap)
    if (wallHits >= 2) {
        isRunning = false; 
        startJumpSequence();
    }
}

// --- THE ROBUST JUMP SEQUENCE ---
function startJumpSequence() {
    
    // 1. STAND
    imgElement.src = ASSETS.stand;
    
    // Ensure we are strictly at the top 0px before starting
    container.style.top = '0px'; 
    container.classList.remove('falling'); // Ensure gravity is OFF

    setTimeout(() => {
        
        // 2. JUMP ANIMATION
        imgElement.src = ASSETS.jump;

        setTimeout(() => {
            
            // 3. MIDAIR IMAGE & ACTIVATE GRAVITY
            imgElement.src = ASSETS.midair;
            
            // A. Turn on the CSS Transition
            container.classList.add('falling');

            // B. Force the browser to realize the class changed (Reflow)
            void container.offsetHeight; 

            // C. Move to Bottom (The transition will now catch this!)
            const floorPosition = window.innerHeight - 64;
            container.style.top = floorPosition + "px";

            // Wait for Fall (2.5s matches CSS)
            setTimeout(() => {
                
                // 4. LAND
                imgElement.src = ASSETS.land;
                onBottom = true;
                
                // Turn off gravity (so she doesn't float if we move her later)
                container.classList.remove('falling');

                // Wait for Landing Pose
                setTimeout(() => {
                    
                    // 5. RESUME RUNNING
                    imgElement.src = ASSETS.run;
                    isRunning = true;
                    wallHits = 0; 
                    animate();

                }, 250); // Land pose duration

            }, 2500); // Fall duration (Must match CSS .falling transition)

        }, 750); // Jump GIF duration

    }, 1000); // Initial Stand duration
}

// --- LISTENERS ---
chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) changes.enabled.newValue ? init() : remove();
});
chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled !== false) init();
});