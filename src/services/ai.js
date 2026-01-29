const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Config file path - stored in user data directory
const configPath = path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to load config:', e);
    }
    return {};
}

function getApiKey() {
    const config = loadConfig();
    return config.apiKey || process.env.OPENAI_API_KEY || '';
}

function getApiProvider() {
    const config = loadConfig();
    return config.provider || 'ollama'; // Default to ollama now
}

function getOllamaModel() {
    const config = loadConfig();
    return config.model || 'llama3.2'; // Fast and high quality model (~2.0GB RAM)
}

function getOllamaUrl() {
    const config = loadConfig();
    return config.ollamaUrl || 'http://127.0.0.1:11434';
}

const TONE_PROMPTS = {
    grammar: 'You are a professional proofreader. Correct all grammar, spelling, punctuation, and syntax errors in the input text. Preserve the original tone and style exactly. Do not rewrite, only correct mistakes. Strictly output ONLY the corrected text.',
    professional: 'You are an expert business editor. Rewrite the input text to be professional, polished, and suitable for formal communication. Enhance clarity and vocabulary while preserving the core message. Strictly output ONLY the rewritten text. Do not include any conversational filler.',
    casual: 'You are a friendly communication assistant. Rewrite the input text to be casual, warm, and conversational. Use approachable language but keep the meaning clear. Strictly output ONLY the rewritten text. Do not include any conversational filler.',
    concise: 'You are a precise editor. Rewrite the input text to be concise and direct. Remove redundancy and unnecessary words while retaining the essential meaning. Strictly output ONLY the shortened text. Do not include any conversational filler.',
    elaborate: 'You are a creative writer. Expand on the input text by adding relevant details, context, and flow to make it more comprehensive. Maintain the original intent. Strictly output ONLY the elaborated text. Do not include any conversational filler.',
};

async function rephraseText(text, tone = 'grammar') {
    const provider = getApiProvider();
    const prompt = TONE_PROMPTS[tone] || TONE_PROMPTS.professional;

    if (provider === 'ollama') {
        return rephraseWithOllama(prompt, text);
    } else if (provider === 'gemini') {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API key not configured. Please set your API key in the config file at: ' + configPath);
        }
        return rephraseWithGemini(apiKey, prompt, text);
    } else {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API key not configured. Please set your API key in the config file at: ' + configPath);
        }
        return rephraseWithOpenAI(apiKey, prompt, text);
    }
}

async function rephraseWithOllama(prompt, text) {
    const fetch = require('node-fetch');
    const ollamaUrl = getOllamaUrl();
    const model = getOllamaModel();

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: `${prompt}\n\nText to rewrite:\n${text}`,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ollama error:', errorText);

            if (response.status === 404) {
                throw new Error(`Model "${model}" not found. Run: ollama pull ${model}`);
            }
            throw new Error(`Ollama request failed: ${errorText}`);
        }

        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error('Ollama error:', error.message, error.code, error.cause);
        if (error.code === 'ECONNREFUSED' ||
            error.cause?.code === 'ECONNREFUSED' ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('fetch failed')) {
            throw new Error('Ollama not running. Start it with: ollama serve');
        }
        console.error('Ollama request failed:', error);
        throw error;
    }
}

async function rephraseWithOpenAI(apiKey, prompt, text) {
    const fetch = require('node-fetch');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: text },
            ],
            max_tokens: 1000,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

async function rephraseWithGemini(apiKey, prompt, text) {
    const fetch = require('node-fetch');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${prompt}\n\nText to rewrite:\n${text}`,
                    }],
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API error:', data);
            throw new Error(data.error?.message || `API request failed with status ${response.status}`);
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Unexpected Gemini response:', data);
            throw new Error('Unexpected response from Gemini API');
        }

        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('Gemini request failed:', error);
        throw error;
    }
}

module.exports = { rephraseText };
