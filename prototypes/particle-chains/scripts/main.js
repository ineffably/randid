import { parseConfig } from "./config.js";
import { createEditor } from "./editor.js";
import { createScene } from "./scene.js";

const stageEl = document.getElementById("stage");
const statusEl = document.getElementById("status");
const applyBtn = document.getElementById("apply-config");
const resetBtn = document.getElementById("reset-config");
const textarea = document.getElementById("config-editor");

const scene = createScene(stageEl);

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#f472b6" : "var(--muted)";
}

function notifyApplied(count) {
  setStatus(`Applied ${count} emitter${count > 1 ? "s" : ""}.`);
}

function applyConfigFromEditor() {
  try {
    const parsed = parseConfig(editor.getValue());
    scene.loadConfig(parsed);
    notifyApplied(parsed.emitters?.length ?? 0);
  } catch (err) {
    setStatus(`Invalid JSON: ${err.message}`, true);
  }
}

function resetToDefaults(apply = false) {
  const defaults = scene.getDefaultConfig();
  editor.setValue(JSON.stringify(defaults, null, 2));
  if (apply) {
    scene.loadConfig(defaults);
    notifyApplied(defaults.emitters.length);
  } else {
    setStatus("Reset editor to defaults.");
  }
}

const editor = createEditor(textarea, {
  onApply: applyConfigFromEditor,
  onChange: () => setStatus("Editing... apply to preview."),
});

applyBtn.addEventListener("click", applyConfigFromEditor);
resetBtn.addEventListener("click", () => resetToDefaults(true));

window.addEventListener("resize", () => {
  scene.resize();
  const current = scene.getCurrentConfig();
  if (current) {
    scene.loadConfig(current);
    notifyApplied(current.emitters?.length ?? 0);
  }
});

scene.resize();
resetToDefaults(true);
