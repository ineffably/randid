# Particle Chain Prototype

This prototype demonstrates chained particle emitters rendered with PixiJS and edited through a CodeMirror JSON pane.

## Running locally

You can serve the prototype from the repository root with any static file server. Two common options:

- Python 3 built-in server:
  ```bash
  cd prototypes/particle-chains
  python -m http.server 8000
  ```
  Then open http://localhost:8000/prototypes/particle-chains/index.html in your browser.

- Node users can install `serve` globally and run it from the repo root:
  ```bash
  npm install -g serve
  serve -l 8000 .
  ```
  Then visit http://localhost:8000/prototypes/particle-chains/index.html.

## Usage notes

- The PixiJS canvas lives inside the **Stage** panel; resizing the browser will reflow the renderer.
- The right-hand CodeMirror panel holds the emitter JSON. Press **Ctrl/Cmd+Enter** to apply your edits, or **Ctrl/Cmd+Space** for completion hints.
- Use **Reset to defaults** to reload the starter chain configuration if the editor state gets messy.
- Status messages below the buttons confirm when changes are applied or if JSON fails validation.
