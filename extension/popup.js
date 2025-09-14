const queryInput = document.getElementById('query-input');
const resultsContainer = document.getElementById('results-container');
const loader = document.getElementById('loader');
const errorContainer = document.getElementById('error-container');
const emojisResults = document.getElementById('emojis-results');
const iconsResults = document.getElementById('icons-results');

// --- CONFIGURATION ---
// This should be the URL of your deployed Cloudflare Worker.
// For local development with `wrangler dev`, the default is http://127.0.0.1:8787
const API_URL = 'http://127.0.0.1:46671';

// --- DEBOUNCE FUNCTION ---
// To avoid sending a request on every keystroke
function debounce(func, delay) {
	let timeout;
	return function(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), delay);
	};
}

// --- API CALL ---
async function getSuggestions(query) {
	showLoader();
	hideError();

	try {
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || `HTTP error! Status: ${response.status}`);
		}

		renderResults(data);

	} catch (error) {
		// This will catch network errors and parsing errors
		console.error('An error occurred:', error);
		showError(error.message);
	} finally {
		hideLoader();
	}
}

// --- UI RENDERING ---
function renderResults(data) {
	resultsContainer.classList.remove('hidden');

	// Clear previous results
	emojisResults.innerHTML = '';
	iconsResults.innerHTML = '';

	// Render Emojis
	if (data.emojis && data.emojis.length > 0) {
		const container = document.createElement('div');
		container.className = 'mb-3';

		const grid = document.createElement('div');
		grid.className = 'grid grid-cols-4 gap-2';

		data.emojis.forEach(emoji => {
			const itemWrapper = document.createElement('div');
			itemWrapper.className = 'relative cursor-pointer flex justify-center items-center bg-white border border-gray-200 rounded-lg p-2 text-2xl transition hover:bg-gray-100';

			const emojiSpan = document.createElement('span');
			emojiSpan.textContent = emoji;
			itemWrapper.appendChild(emojiSpan);

			itemWrapper.onclick = () => {
				navigator.clipboard.writeText(emoji);

				// Prevent multiple "Copied!" messages
				if (itemWrapper.querySelector('.copied-message')) {
					return;
				}

				const copiedMessage = document.createElement('span');
				copiedMessage.className = 'absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 text-white text-xs font-bold rounded-lg';
				copiedMessage.textContent = 'Copied!';
				itemWrapper.appendChild(copiedMessage);

				setTimeout(() => {
					copiedMessage.remove();
				}, 3000);
			};
			grid.appendChild(itemWrapper);
		});

		container.appendChild(grid);
		emojisResults.appendChild(container);
	}

	// Render Icons
	if (data.iconSuggestions) {
		renderIconLibrary('Heroicons', data.iconSuggestions.heroicons, 'https://heroicons.com/?query=');
		renderIconLibrary('Lucide', data.iconSuggestions.lucide, 'https://lucide.dev/icons/');
	}
}

function renderIconLibrary(title, icons, baseUrl) {
	if (!icons || icons.length === 0) return;

	const container = document.createElement('div');
	container.className = 'mb-3';

	const titleEl = document.createElement('div');
	titleEl.className = 'font-medium mb-2';
	titleEl.textContent = title;
	container.appendChild(titleEl);

	const grid = document.createElement('div');
	grid.className = 'grid grid-cols-4 gap-2';

	icons.forEach(iconName => {
		const link = document.createElement('a');
		link.className = 'bg-white border border-gray-200 rounded-lg p-2 text-center text-xs text-gray-800 transition hover:bg-gray-100 no-underline';
		link.textContent = iconName;
		link.href = title === 'Lucide' ? `${baseUrl}${iconName}` : `${baseUrl}${iconName.replace(/\s/g, '-')}`;
		link.target = '_blank';
		grid.appendChild(link);
	});

	container.appendChild(grid);
	iconsResults.appendChild(container);
}

// --- UI STATE HELPERS ---
function showLoader() {
	loader.classList.remove('hidden');
	resultsContainer.classList.add('hidden');
}

function hideLoader() {
	loader.classList.add('hidden');
}

function showError(message) {
	resultsContainer.classList.remove('hidden');
	errorContainer.textContent = `Error: ${message}`;
	errorContainer.classList.remove('hidden');
	emojisResults.innerHTML = '';
	iconsResults.innerHTML = '';
}

function hideError() {
	errorContainer.classList.add('hidden');
}

// --- EVENT LISTENERS ---
const debouncedGetSuggestions = debounce(getSuggestions, 500);

queryInput.addEventListener('input', (e) => {
	const query = e.target.value.trim();
	if (query.length > 1) {
		debouncedGetSuggestions(query);
	} else {
		resultsContainer.classList.add('hidden');
	}
});
