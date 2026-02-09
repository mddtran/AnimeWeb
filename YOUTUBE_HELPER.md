# YouTube Playlist to JSON Generator

A utility guide for quickly extracting video links from YouTube playlists and formatting them for `data.js`.

## Instructions

### Step 1: Open YouTube Playlist
Navigate to a YouTube Playlist overview page:
```
https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID
```

### Step 2: Load All Videos
Scroll down to the bottom of the playlist page to ensure all videos are loaded in the DOM. The script will only detect videos that have been rendered.

### Step 3: Open Developer Console
Press **F12** (or right-click → Inspect → Console tab) to open the browser Developer Console.

### Step 4: Paste the Script
Copy the entire JavaScript code block below and paste it into the Console, then press **Enter**:

```javascript
(function() {
    let results = [];
    // Find all video title elements
    let items = document.querySelectorAll('a#video-title');

    if (items.length === 0) {
        console.error("❌ ERROR: No videos found! Make sure you are on the 'youtube.com/playlist?list=...' page and have scrolled to the bottom.");
        return;
    }

    console.log(`✅ Found ${items.length} videos. Processing...`);

    items.forEach((el, index) => {
        // Get title and clean whitespace
        let title = el.title.trim() || el.innerText.trim();
        // Escape double quotes to prevent JSON errors
        title = title.replace(/"/g, '\\"');
        
        // Get original Link
        let href = el.href;
        if (!href) return;

        // Extract only the Video ID to create a clean link
        try {
            let urlObj = new URL(href);
            let vId = urlObj.searchParams.get("v");
            if (vId) {
                let cleanLink = `https://www.youtube.com/watch?v=${vId}`;
                // Format for data.js
                results.push(`    { name: "${title}", stream_url: "${cleanLink}" }`);
            }
        } catch (e) {
            console.warn("Skipping invalid link:", href);
        }
    });

    // Output result to console
    let finalString = results.join(',\n');
    console.log("\n👇 COPY THE TEXT BELOW INTO data.js (Inside 'episodes' array): 👇\n\n" + finalString);
    
    // Auto-copy to clipboard if allowed
    try {
        copy(finalString);
        console.log("\n✨ Auto-copied to Clipboard! Just press Paste (Ctrl+V) in your code.");
    } catch (e) {
        console.log("⚠️ Could not auto-copy. Please manually select and copy the text above.");
    }
})();
```

### Step 5: Copy the Output
The console will display a formatted list of episodes. You will either:
- **See "Auto-copied to Clipboard!"** → The data is ready to paste directly into `data.js`
- **See "Could not auto-copy"** → Manually select and copy the text from the console

### Step 6: Update data.js
Open `assets/js/data.js` and paste the output into the `episodes` array of your anime object:

```javascript
{
    id: "anime-id",
    title: "Anime Title",
    description: "...",
    thumbnail: "...",
    episodes: [
        // PASTE THE OUTPUT HERE
        { name: "Episode 01", stream_url: "https://www.youtube.com/watch?v=..." },
        { name: "Episode 02", stream_url: "https://www.youtube.com/watch?v=..." }
    ]
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No videos found" | Ensure you're on the YouTube playlist page and have scrolled to load all videos. |
| Retrieved wrong links | Make sure the selector `a#video-title` still matches YouTube's current DOM structure. |
| JSON syntax errors | The script auto-escapes double quotes. If issues persist, manually check the titles. |

## Notes

- This script extracts video **titles** and **URLs** directly from the YouTube playlist page
- The output is formatted as valid JSON objects ready for `data.js`
- Each episode object includes `name` (title) and `stream_url` (YouTube link)
- The hybrid player in `watch.js` automatically detects YouTube URLs and embeds them as iframes
