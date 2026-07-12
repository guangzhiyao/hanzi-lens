# HanziLens

Draw · Recognize · Learn — a self-hosted Chinese character learning tool with handwriting recognition and stroke order animations.

## Quick Start

```bash
git clone https://github.com/guangzhiyao/hanzi-lens.git
cd hanzi-lens
npm install
npm run dev
```

Open `http://localhost:5173` — start drawing on the left canvas.

Build & preview:
```bash
npm run build
npm run preview
```

Run tests:
```bash
npm test
```

## How It Works

1. **Draw** a character on the canvas (mouse or touch)
2. **Recognition** runs in a Web Worker via Rust→WASM, returning the top 8 candidates
3. **Click** a candidate to see its stroke order animation
4. **Practice** with the quiz mode — trace strokes in the correct order
5. **Learn** with the dictionary panel showing pinyin and English meaning

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vue 3 + TypeScript + Tailwind CSS v4 |
| Build | Vite |
| Stroke animation | [Hanzi Writer](https://github.com/chanind/hanzi-writer) |
| Handwriting recognition | [hanzi_lookup](https://github.com/gugray/hanzi_lookup) (Rust → WASM) |
| Dictionary | [CC-CEDICT](https://cc-cedict.org/wiki/) |
| Stroke data | [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) |

## License & Attribution

This project's original code is licensed under the **MIT License**.

It builds upon these excellent open-source projects:

| Project | License | Usage |
|---------|---------|-------|
| [Hanzi Writer](https://github.com/chanind/hanzi-writer) | MIT | Stroke order SVG rendering and animations |
| [hanzi_lookup](https://github.com/gugray/hanzi_lookup) | LGPL-3.0 | Handwriting recognition (compiled to WASM) |
| [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) | Arphic Public License | Character stroke data (used by both Hanzi Writer and hanzi_lookup) |
| [CC-CEDICT](https://cc-cedict.org/wiki/) | CC BY-SA 4.0 | Chinese-English dictionary data |

The Arphic Public License covers the character stroke data originally extracted from Arphic Technology fonts. The CC-CEDICT data is used under CC BY-SA 4.0. See [LICENSE](LICENSE) for details.

## Project Structure

```
src/
├── components/
│   ├── HandwritingCanvas.vue   # Drawing surface + stroke capture
│   ├── StrokeViewer.vue        # Character input + animation + quiz
│   ├── CharacterInfo.vue       # Dictionary display (pinyin + meaning)
│   └── ResultModal.vue         # Quiz results modal
├── composables/
│   └── useHanziLookup.ts       # WASM Web Worker interface
├── data/
│   ├── dictionary.ts           # Dictionary lookup + pinyin formatting
│   └── pinyin.ts               # Numbered pinyin → tone mark converter
├── types/
│   ├── hanzi-writer.d.ts       # Hanzi Writer TypeScript declarations
│   └── hanzi-lookup.ts         # Stroke/match type definitions
├── App.vue                     # Main layout + script mode toggle
└── main.ts

public/
├── wasm/                       # Compiled hanzi_lookup WASM
├── workers/                    # Web Worker for recognition
└── dict.json                   # CC-CEDICT single-character dictionary (906 KB)
```

## Building the WASM

The `public/wasm/` directory contains a pre-built copy of [hanzi_lookup](https://github.com/gugray/hanzi_lookup) compiled to WebAssembly. To rebuild:

```bash
# Requires Rust with wasm32 target and wasm-bindgen-cli
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli

# Clone and build
git clone https://github.com/gugray/hanzi_lookup.git
cd hanzi_lookup/hanzi_lookup
cargo build --target wasm32-unknown-unknown --release
wasm-bindgen ../target/wasm32-unknown-unknown/release/hanzi_lookup.wasm \
  --out-dir ./dist --no-modules --no-typescript

# Copy output to hanzi-trainer/public/wasm/
```

## Updating the Dictionary

The dictionary is built from CC-CEDICT. To regenerate `public/dict.json`:

```bash
# Download latest CC-CEDICT
curl -o cedict.zip 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip'
unzip cedict.zip

# Parse single-character entries (Python script in the build pipeline)
python3 scripts/build_dict.py cedict_ts.u8 public/dict.json
```

## Contributing

Pull requests welcome. Areas that could use help:

- Additional dictionary data (multi-character compounds, example sentences)
- Character radical/component information
- Spaced repetition (SRS) integration
- PWA offline support
- More quiz modes (meaning→character, pinyin→character)

## Author

Built as a learning companion for studying Chinese characters.
