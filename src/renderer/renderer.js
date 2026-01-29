// DOM Elements
const originalText = document.getElementById('originalText');
const resultContent = document.getElementById('resultContent');
const loading = document.getElementById('loading');
const errorText = document.getElementById('errorText');
const useBtn = document.getElementById('useBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.getElementById('closeBtn');
const toneBtns = document.querySelectorAll('.tone-btn');
const themeBtn = document.getElementById('themeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const copyOriginalBtn = document.getElementById('copyOriginalBtn');
const originalCount = document.getElementById('originalCount');
const resultCount = document.getElementById('resultCount');
const variationTabs = document.getElementById('variationTabs');
const varBtns = document.querySelectorAll('.var-btn');

// Settings elements
const modelSelect = document.getElementById('modelSelect');
const autoPasteToggle = document.getElementById('autoPasteToggle');
const variationsToggle = document.getElementById('variationsToggle');

let currentTone = 'grammar';
let rephrasedText = '';
let clipboardText = '';
let isDarkTheme = true;
let variations = [];
let currentVariation = 0;

// Settings
let settings = {
    model: 'qwen2.5:0.5b',
    autoPaste: true,
    generateVariations: false,
    theme: 'dark'
};

// Load settings
async function loadSettings() {
    try {
        const loaded = await window.api.getSettings();
        if (loaded) {
            settings = { ...settings, ...loaded };
        }
    } catch (e) {
        console.log('Using default settings');
    }

    // Apply loaded settings
    isDarkTheme = settings.theme !== 'light';
    applyTheme();
    modelSelect.value = settings.model;
    autoPasteToggle.checked = settings.autoPaste;
    variationsToggle.checked = settings.generateVariations;
}

// Apply theme
function applyTheme() {
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeBtn.textContent = isDarkTheme ? '☀️' : '🌙';
}

// Initialize
async function init() {
    await loadSettings();
    clipboardText = await window.api.getClipboard();
    originalText.textContent = clipboardText;
    updateCharCount(originalCount, clipboardText);

    // Auto-start rephrasing
    rephrase();
}

// Update character count
function updateCharCount(element, text) {
    const chars = text ? text.length : 0;
    element.textContent = `${chars} chars`;
}

// Rephrase function
async function rephrase() {
    if (!clipboardText) return;

    // Show loading
    loading.classList.add('show');
    resultContent.classList.remove('show');
    errorText.classList.remove('show');
    useBtn.disabled = true;
    variationTabs.style.display = 'none';
    variations = [];

    try {
        if (settings.generateVariations) {
            // Generate 3 variations
            const promises = [
                window.api.rephrase(clipboardText, currentTone),
                window.api.rephrase(clipboardText, currentTone),
                window.api.rephrase(clipboardText, currentTone)
            ];
            const results = await Promise.all(promises);

            variations = results.filter(r => r.success).map(r => r.text);

            if (variations.length > 0) {
                variationTabs.style.display = 'flex';
                currentVariation = 0;
                showVariation(0);
                useBtn.disabled = false;
            } else {
                errorText.textContent = 'Failed to generate variations';
                errorText.classList.add('show');
            }
        } else {
            const result = await window.api.rephrase(clipboardText, currentTone);

            if (result.success) {
                rephrasedText = result.text;
                resultContent.textContent = rephrasedText;
                resultContent.classList.add('show');
                updateCharCount(resultCount, rephrasedText);
                useBtn.disabled = false;
            } else {
                errorText.textContent = result.error || 'Failed to rephrase. Please try again.';
                errorText.classList.add('show');
            }
        }
    } catch (error) {
        errorText.textContent = error.message || 'An error occurred';
        errorText.classList.add('show');
    } finally {
        loading.classList.remove('show');
    }
}

// Show variation
function showVariation(index) {
    currentVariation = index;
    rephrasedText = variations[index];
    resultContent.textContent = rephrasedText;
    resultContent.classList.add('show');
    updateCharCount(resultCount, rephrasedText);

    varBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

// Variation tab clicks
varBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => showVariation(index));
});

// Tone selection
toneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTone = btn.dataset.tone;
        rephrase();
    });
});

// Theme toggle
themeBtn.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    settings.theme = isDarkTheme ? 'dark' : 'light';
    applyTheme();
});

// Copy original
copyOriginalBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(clipboardText);
    copyOriginalBtn.textContent = '✅';
    setTimeout(() => copyOriginalBtn.textContent = '📋', 1000);
});

// Settings panel
settingsBtn.addEventListener('click', () => {
    settingsOverlay.classList.add('show');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsOverlay.classList.remove('show');
});

saveSettingsBtn.addEventListener('click', async () => {
    settings.model = modelSelect.value;
    settings.autoPaste = autoPasteToggle.checked;
    settings.generateVariations = variationsToggle.checked;

    await window.api.saveSettings(settings);
    settingsOverlay.classList.remove('show');
});

// Use the rephrased text
useBtn.addEventListener('click', async () => {
    if (rephrasedText) {
        await window.api.useText(rephrasedText, settings.autoPaste);
    }
});

// Cancel / Close
cancelBtn.addEventListener('click', () => window.api.closeWindow());
closeBtn.addEventListener('click', () => window.api.closeWindow());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (settingsOverlay.classList.contains('show')) {
            settingsOverlay.classList.remove('show');
        } else {
            window.api.closeWindow();
        }
    } else if (e.key === 'Enter' && !useBtn.disabled) {
        useBtn.click();
    }
});

// Start
init();
