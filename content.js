// --- CONFIGURATION ---
const ASSETS = {
    run: chrome.runtime.getURL('running-standard.gif'),
    stand: chrome.runtime.getURL('standing-old.png'),
    jump: chrome.runtime.getURL('jumping-old.gif'),
    midair: chrome.runtime.getURL('midair-old.png'),
    land: chrome.runtime.getURL('land-old.png'), // New Asset
    thinking: chrome.runtime.getURL('thinking.png'),
    thinkingBack: chrome.runtime.getURL('thinking-back.png')
};

const BUBBLE_LINES = [
    "Hmmmm, reading ${document.title}, I see!",
    "Oh, ${document.title}? That's interesting!",
    "Hmm, ${document.title} seems fun!",
    "Enjoying ${document.title}, aisa kya hai isme?",
    "${document.title} pe kuch zyada hi nahi, huh?"
];
const MID_BUBBLE_LINES = [
    "Uhhh...Let's see what my silly girl is browsing.",
    "Exploring WITHOUT ME⁉️",
    "Hmm, ${document.title} again? Kuch aur bhi dekh le 💔💔💔",
    "I wonder what ${document.title} is about...",
    "Browsing ${document.title} akele akele? Tu ruk ab...🤬💢",
];

// --- STATE VARIABLES ---
let container = null;
let imgElement = null;
let animationId = null;

let positionX = 0;
let direction = 1; 
let isRunning = false;
let onBottom = false;
let bottomPasses = 0;
let hasStoppedTop = false;
let hasStoppedBottom = false;
let sessionPixels = 0;
let saveInterval = null;

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
    onBottom = false;
    bottomPasses = 0;
    hasStoppedTop = false;
    hasStoppedBottom = false;
    isRunning = true;
    
    // Start tracking distance saving (every 5 seconds)
    saveInterval = setInterval(() => {
        if (sessionPixels > 0) {
            chrome.storage.local.get(['pixelRunnerDistance'], (result) => {
                const currentTotal = result.pixelRunnerDistance || 0;
                chrome.storage.local.set({ pixelRunnerDistance: currentTotal + sessionPixels });
                sessionPixels = 0; // Reset session buffer
            });
        }
    }, 5000);

    animate();
}

function remove() {
    isRunning = false;
    if (saveInterval) clearInterval(saveInterval);
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
    
    // Track distance
    if (isRunning) sessionPixels += speed;

    // --- RANDOM STOP LOGIC ---
    // Check if we are in the middle 60% of the screen AND running Left-to-Right
    if (isRunning && direction === 1 && positionX > (screenWidth * 0.2) && positionX < (screenWidth * 0.8)) {
        // Determine if we are allowed to stop based on vertical position
        const stopNeeded = onBottom ? !hasStoppedBottom : !hasStoppedTop;

        // 0.5% chance per frame to stop (approx once per run across screen)
        if (stopNeeded && Math.random() < 0.005) {
            performRandomStop();
            return; // Pause the animation loop here
        }
    }
    // -------------------------

    if (positionX >= (screenWidth - charWidth)) {
        // RIGHT WALL
        if (!onBottom) {
            // CASE A & B: Top Right -> Stop, Think, then Return.
            positionX = screenWidth - charWidth; 
            container.style.left = positionX + 'px';
            isRunning = false; 

            imgElement.src = ASSETS.thinking;
            const bubble = document.getElementById('pixel-runner-bubble');
            bubble.innerText = getRandomBubbleLine();
            
            // Add 'below' class so it appears on screen (since we are at top)
            bubble.classList.add('visible', 'below');

            setTimeout(() => {
                bubble.classList.remove('visible', 'below');
                imgElement.src = ASSETS.run;
                direction = -1; // Run Left
                container.style.transform = "scaleX(-1)";
                isRunning = true;
                animate(); 
            }, 5000); // 5 seconds think time
            return; 
        } else {
            // Bottom Right
            if (bottomPasses === 0) {
                // 1st time reaching right: Turn around (Run R -> L)
                bottomPasses++;
                direction = -1;
                container.style.transform = "scaleX(-1)";
            } else {
                // 2nd time reaching right: Fly Up!
                startFlyUpSequence();
            }
        }

    } else if (positionX <= 0) {
        // LEFT WALL
        if (!onBottom) {
            // CASE C & D: Top Left -> Jump Down immediately
            isRunning = false;
            // Fix: Face right (away from wall) before jumping
            direction = 1;
            container.style.transform = "scaleX(1)";
            startJumpSequence();
        } else {
            // Bottom Left -> Turn around
            direction = 1;
            container.style.transform = "scaleX(1)";
        }
    }

    container.style.left = positionX + 'px';
    
    if (isRunning) {
        animationId = requestAnimationFrame(animate);
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
                bottomPasses = 0; // Reset passes for the new bottom cycle
                
                // Turn off gravity (so she doesn't float if we move her later)
                container.classList.remove('falling');

                // Wait for Landing Pose
                setTimeout(() => {
                    
                    // 5. RESUME RUNNING
                    imgElement.src = ASSETS.run;
                    isRunning = true;
                    animate();

                }, 250); // Land pose duration

            }, 2500); // Fall duration (Must match CSS .falling transition)

        }, 750); // Jump GIF duration

    }, 1000); // Initial Stand duration
}

function startFlyUpSequence() {
    isRunning = false;
    
    // 1. Prepare to Fly
    imgElement.src = ASSETS.midair;
    container.classList.add('climbing');
    
    // 2. Fly Up (Animation handled by CSS)
    container.style.top = '0px';

    setTimeout(() => {
        // 3. Arrive at Top
        onBottom = false;
        
        // RESET FREQUENCY COUNTERS (New Loop Starts)
        hasStoppedTop = false;
        hasStoppedBottom = false;

        container.classList.remove('climbing');
        
        // 4. Resume Running Left
        imgElement.src = ASSETS.run;
        direction = -1;
        container.style.transform = "scaleX(-1)";
        isRunning = true;
        animate();
    }, 2500); // Match CSS transition duration
}

function performRandomStop() {
    isRunning = false;
    imgElement.src = ASSETS.thinkingBack;

    const bubble = document.getElementById('pixel-runner-bubble');
    
    // Pick random line from MID_BUBBLE_LINES
    const randomIndex = Math.floor(Math.random() * MID_BUBBLE_LINES.length);
    bubble.innerText = MID_BUBBLE_LINES[randomIndex].replace('${document.title}', document.title);

    bubble.classList.add('visible');
    // If at the top, force bubble below character
    if (!onBottom) bubble.classList.add('below');

    // Set flag so we don't stop again this level
    if (onBottom) hasStoppedBottom = true;
    else hasStoppedTop = true;

    setTimeout(() => {
        bubble.classList.remove('visible', 'below');
        imgElement.src = ASSETS.run;
        isRunning = true;
        animate();
    }, 5000); // 5 seconds pause
}

// --- LISTENERS ---
chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) changes.enabled.newValue ? init() : remove();
});
chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled !== false) init();
});

function getRandomBubbleLine() {
    const randomIndex = Math.floor(Math.random() * BUBBLE_LINES.length);
    return BUBBLE_LINES[randomIndex].replace('${document.title}', document.title);
}