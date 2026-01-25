// DOM Elements
const originalText = document.getElementById('originalText');
const resultContent = document.getElementById('resultContent');
const loading = document.getElementById('loading');
const errorText = document.getElementById('errorText');
const useBtn = document.getElementById('useBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.getElementById('closeBtn');
const toneBtns = document.querySelectorAll('.tone-btn');

let currentTone = 'professional';
let rephrasedText = '';
let clipboardText = '';

// Initialize
async function init() {
    clipboardText = await window.api.getClipboard();
    originalText.textContent = clipboardText;

    // Auto-start rephrasing
    rephrase();
}

// Rephrase function
async function rephrase() {
    if (!clipboardText) return;

    // Show loading
    loading.classList.add('show');
    resultContent.classList.remove('show');
    errorText.classList.remove('show');
    useBtn.disabled = true;

    try {
        const result = await window.api.rephrase(clipboardText, currentTone);

        if (result.success) {
            rephrasedText = result.text;
            resultContent.textContent = rephrasedText;
            resultContent.classList.add('show');
            useBtn.disabled = false;
        } else {
            errorText.textContent = result.error || 'Failed to rephrase. Please try again.';
            errorText.classList.add('show');
        }
    } catch (error) {
        errorText.textContent = error.message || 'An error occurred';
        errorText.classList.add('show');
    } finally {
        loading.classList.remove('show');
    }
}

// Tone selection
toneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTone = btn.dataset.tone;
        rephrase();
    });
});

// Use the rephrased text
useBtn.addEventListener('click', async () => {
    if (rephrasedText) {
        await window.api.useText(rephrasedText);
    }
});

// Cancel / Close
cancelBtn.addEventListener('click', () => window.api.closeWindow());
closeBtn.addEventListener('click', () => window.api.closeWindow());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.api.closeWindow();
    } else if (e.key === 'Enter' && !useBtn.disabled) {
        useBtn.click();
    }
});

// Start
init();
