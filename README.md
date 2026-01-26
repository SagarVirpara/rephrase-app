# RePhrase

A system-wide text rephrasing app powered by **local AI** (Ollama). Works completely offline and private.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)

## ✨ Features

### Core Features
- 🌍 **Cross-platform** - Works on macOS and Windows
- ⌨️ **Global Shortcut** - Trigger from any app with `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Win)
- ✨ **5 Tone Options** - Professional, Casual, Concise, Elaborate, Grammar
- 🔒 **Privacy First** - No accounts, no cloud, runs 100% locally
- 🪶 **Lightweight** - Works on low-end systems with just 1-2 GB RAM

### V2 Features
- 🎨 **Dark/Light Theme** - Toggle with one click
- ⚙️ **Settings Panel** - Configure model, auto-paste, and variations
- 📋 **Copy Original** - Quick copy button for original text
- 📊 **Character Count** - See char count for both texts
- 📝 **Grammar Mode** - Fix grammar without changing tone
- 🔄 **Multiple Variations** - Generate 3 options to choose from
- ✅ **Auto-paste** - Automatically paste after clicking "Use This"
- 🔧 **Model Selector** - Switch AI models from settings

---

## Prerequisites

### Ollama (Required)

RePhrase uses [Ollama](https://ollama.com) to run AI locally.

#### macOS
```bash
brew install ollama
ollama serve &
ollama pull qwen2.5:0.5b
```

#### Windows
1. Download from: https://ollama.com/download/windows
2. Install and run Ollama
3. Open Command Prompt:
   ```cmd
   ollama pull qwen2.5:0.5b
   ```

---

## Recommended Models

| Model | Size | RAM | Best For |
|-------|------|-----|----------|
| `qwen2.5:0.5b` | 397 MB | ~1 GB | **Low-end systems** (default) |
| `gemma3:1b` | 815 MB | ~2 GB | Better quality, lightweight |
| `gemma3:4b` | 3.3 GB | ~4 GB | High quality |
| `llama3.2` | 2 GB | ~4 GB | Good balance |

---

## Installation

### Pre-built Downloads

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `RePhrase.dmg` |
| Windows | `RePhrase 1.0.0.exe` |

### Build from Source

```bash
git clone <repo-url>
cd rephrase-app
npm install
npm start
```

---

## Configuration

**Config file location:**
- **macOS**: `~/Library/Application Support/rephrase-app/config.json`
- **Windows**: `%APPDATA%\rephrase-app\config.json`

### For Local AI (Ollama)
```json
{
    "provider": "ollama",
    "model": "qwen2.5:0.5b"
}
```

### For Cloud AI
```json
{
    "provider": "openai",
    "apiKey": "sk-your-api-key"
}
```

Supported providers: `ollama`, `openai`, `gemini`

---

## Usage

1. **Copy text** from any app (`Cmd+C` / `Ctrl+C`)
2. **Press hotkey** (`Cmd+Shift+R` / `Ctrl+Shift+R`)
3. **Select tone** (Professional, Casual, Concise, Elaborate, Grammar)
4. **Wait** for AI to rephrase
5. **Click "Use This"** or press `Enter`
6. Text is automatically pasted (if auto-paste enabled)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+Shift+R` | Open RePhrase |
| `Enter` | Use rephrased text |
| `Esc` | Close window |

---

## Settings

Click ⚙️ in the header to access settings:

| Setting | Description |
|---------|-------------|
| **AI Model** | Choose from installed Ollama models |
| **Auto-paste** | Automatically paste after "Use This" |
| **Multiple Variations** | Generate 3 options to choose from |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Ollama not running" | Run `ollama serve` in terminal |
| Model not found | Run `ollama pull qwen2.5:0.5b` |
| Auto-paste not working | Grant Accessibility permissions in System Settings |
| Slow first response | Normal - model loading takes 5-15s first time |

---

## Build for Distribution

```bash
# macOS
npm run make -- --platform=darwin

# Windows
npm run build-win
```

---

## Project Structure

```
rephrase-app/
├── src/
│   ├── main/
│   │   ├── main.js         # Electron main process
│   │   └── preload.js      # IPC bridge
│   ├── renderer/
│   │   ├── index.html      # UI layout
│   │   ├── styles.css      # Themes & styling
│   │   └── renderer.js     # UI logic
│   └── services/
│       └── ai.js           # AI provider integration
├── config/
│   └── config.example.json # Example config
├── assets/                 # App icons
├── out/                    # Build output
├── package.json
├── forge.config.js         # Electron Forge config
└── README.md
```

---

## Tech Stack

- **Electron** - Cross-platform desktop app
- **Ollama** - Local AI inference
- **Node.js** - Backend logic

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Submit a PR

## License

MIT
