# RePhrase App

A system-wide text rephrasing app powered by **local AI** (Ollama). Works completely offline and private.

## Features

- 🌍 **Cross-platform** - Works on macOS and Windows
- ⌨️ **Global Shortcut** - Trigger from any app with `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Win)
- ✨ **Multiple Tones** - Professional, Casual, Concise, Elaborate
- 🎨 **Beautiful UI** - Minimal floating window with dark theme
- 🔒 **Privacy First** - No accounts, no cloud, runs 100% locally
- 🪶 **Lightweight** - Works on low-end systems with just 1-2 GB RAM

---

## Prerequisites

### Ollama (Required)

RePhrase uses [Ollama](https://ollama.com) to run AI locally on your machine.

#### macOS
```bash
brew install ollama
ollama serve &
ollama pull qwen2.5:0.5b
```

#### Windows
1. Download from: https://ollama.com/download/windows
2. Install and run Ollama
3. Open Command Prompt and run:
   ```cmd
   ollama pull qwen2.5:0.5b
   ```

> **Note**: The `qwen2.5:0.5b` model is only ~400MB and works great on low-end systems!

---

## Recommended Models

| Model | Size | RAM | Best For |
|-------|------|-----|----------|
| `qwen2.5:0.5b` | 397 MB | ~1 GB | **Low-end systems** (recommended) |
| `gemma3:1b` | 815 MB | ~2 GB | Better quality, still lightweight |
| `gemma3:4b` | 3.3 GB | ~4 GB | High quality |
| `llama3.2` | 2 GB | ~4 GB | Good balance |

---

## Installation

### Option 1: Download Pre-built App

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | `RePhrase.dmg` |
| Windows (ARM64) | `RePhrase 1.0.0.exe` |

### Option 2: Build from Source

```bash
git clone <repo-url>
cd rephrase-app
npm install
npm start
```

---

## Configuration

Create a config file:

- **macOS**: `~/Library/Application Support/rephrase-app/config.json`
- **Windows**: `%APPDATA%\rephrase-app\config.json`

### For Local AI (Ollama) - Recommended
```json
{
    "provider": "ollama",
    "model": "qwen2.5:0.5b"
}
```

### For Higher Quality (More RAM needed)
```json
{
    "provider": "ollama",
    "model": "gemma3:4b"
}
```

### For Cloud AI (Optional)
```json
{
    "provider": "openai",
    "apiKey": "sk-your-api-key"
}
```
Providers: `openai`, `gemini`

---

## Usage

1. **Copy text** from any app (`Cmd+C` / `Ctrl+C`)
2. **Press hotkey** (`Cmd+Shift+R` / `Ctrl+Shift+R`)
3. **Select tone** (Professional, Casual, Concise, Elaborate)
4. **Wait** for AI to rephrase
5. **Click "Use This"** or press `Enter`
6. **Paste** the improved text (`Cmd+V` / `Ctrl+V`)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+Shift+R` | Open RePhrase window |
| `Enter` | Use rephrased text |
| `Esc` | Close window |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Ollama not running" | Run `ollama serve` in terminal |
| Model not found | Run `ollama pull qwen2.5:0.5b` |
| Slow first response | Normal - model loading into memory (5-10s first time) |

---

## Build for Distribution

```bash
# macOS
npm run make -- --platform=darwin

# Windows
npm run build-win
```

## License

MIT
