# Emoji & Icon Finder

This project is a browser extension that provides emoji and icon suggestions (from Heroicons and Lucide) for any given word or concept. It uses a Cloudflare Worker with Workers AI as the backend.

## Project Structure

```
emoji-finder/
├── api/                  # Cloudflare Worker API
│   ├── src/index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml
├── extension/            # Browser Extension
│   ├── images/icon.svg
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── style.css
└── README.md             # This file
```

---

## Step 1: Running the API (Backend)

The API is a Cloudflare Worker. You can run it locally for development or deploy it globally.

1.  **Navigate to the API directory:**
    ```bash
    cd emoji-finder/api
    ```

2.  **Install dependencies:**
    This command installs `wrangler` (the Cloudflare CLI) and the necessary TypeScript types.
    ```bash
    npm install
    ```

3.  **Run the local development server:**
    This will start a local server at `http://127.0.0.1:8787`, which the extension is pre-configured to use for development.
    ```bash
    npm run dev
    ```

4.  **(Optional) Deploy to Cloudflare:**
    When you're ready for a production version, this command will deploy your API to the Cloudflare global network. You'll need a free Cloudflare account set up first.
    ```bash
    npm run deploy
    ```

---

## Step 2: Using the Browser Extension (Frontend)

1.  **Update the API URL (if deployed):**
    If you deployed your worker in the previous step, it will have a public URL (e.g., `https://emoji-finder-api.<your-subdomain>.workers.dev`). You must open `emoji-finder/extension/popup.js` and change the `API_URL` constant on line 7 to your new public URL.

2.  **Load the extension in your browser:**

    *   **Chrome/Edge:**
        1.  Open your browser and navigate to `chrome://extensions`.
        2.  Turn on the **Developer mode** toggle (usually in the top right).
        3.  Click **Load unpacked**.
        4.  Select the `emoji-finder/extension` folder on your filesystem.

    *   **Firefox:**
        1.  Navigate to `about:debugging`.
        2.  Click **This Firefox**.
        3.  Click **Load Temporary Add-on...**.
        4.  Select the `manifest.json` file inside the `emoji-finder/extension` folder.

---

## How to Use

Once the API is running (either locally or deployed) and the extension is loaded, click on the new icon in your browser's toolbar. The popup will appear. Start typing in the input box, and the emoji and icon suggestions will appear below.
