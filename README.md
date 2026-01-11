# Pixel Runner Chrome Extension
A fun little Chrome extension that adds a little pixelated character who runs across the top of your browser window.

### Meet Devina!
<img src="chibi-pixel.png" alt="Pixel art character" width="250">

The whimsical girl who runs across your browser. What is she trying to do? Maybe she finds what you're reading interesting? Hard to tell, she's a curious little hobbit after all.


## 📦Current Features

- **Animated Character**: A pixelated character runs back and forth at the top of your screen.
- **Page Interaction**: When the character reaches the right side of the screen, it "reads" the current page's title and displays it in a speech bubble.
- **Toggle On/Off**: Easily enable or disable the character using the extension's popup icon.
- **Persistent State**: Your on/off preference is saved and remembered across browser sessions.
- **Crisp Pixel Art**: Uses `image-rendering: pixelated` to ensure the GIF looks sharp and not blurry.

## 🛠️Planned Features

- **Animated Character**: More movements for the character, more area to be covered in the upcomming releases.
- **Page Interaction**: Character will be equiped with a ladder and a hook to traverse the webpage.
- **Extension**: Future updated will add more color and life to the otherwise bland extension.
## 🔆How It Works

This extension is built with standard web technologies and Chrome Extension APIs.

-   **`content.js`**: This is the core script injected into web pages. It's responsible for:
    -   Creating and injecting the character's HTML elements (`div` container, `img` tag for the GIF, and a `div` for the speech bubble).
    -   Running the animation loop using `requestAnimationFrame` to move the character horizontally.
    -   Detecting screen boundaries to reverse the character's direction.
    -   Triggering the "read page title" action.
-   **`popup.js`**: This script manages the logic for the extension's popup. It allows the user to turn the extension on or off. The state is stored using the `chrome.storage.sync` API, so it persists between sessions.
-   **`styles.css`**: This file contains the styling for the character's container, the GIF itself, and the speech bubble. It uses a high `z-index` to ensure the character appears on top of most page content and `pointer-events: none` so the character doesn't interfere with clicking on the page.
-   **`chrome.storage.onChanged`**: A listener in `content.js` watches for changes in the on/off state and will either create (`init()`) or remove (`remove()`) the character from the page accordingly.

## 📂Core Project Files

-   `manifest.json`: The extension's manifest file, defining permissions, scripts, and the popup.
-   `content.js`: The main content script for animating the character.
-   `popup.html`: The HTML structure for the popup window.
-   `popup.js`: The JavaScript logic for the popup window.
-   `styles.css`: The stylesheet for the character and speech bubble.
-   `runGIF-trans.gif`: The animated GIF of the running character.
-   `icon.png` (or similar): The icon for the extension in the browser toolbar.

## 📩How to Install (for development)

1.  Download or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable the **"Developer mode"** toggle in the top-right corner.
4.  Click the **"Load unpacked"** button.
5.  Select the directory where you saved the project files.
6.  The Pixel Runner extension should now appear in your extensions list and in your browser toolbar!

### ⏳ Since this project is still in early development, an official Google Webstore release is pending. I plan to release this before 12th March 2026.  
