function chainHint(cm) {
  const cursor = cm.getCursor();
  const token = cm.getTokenAt(cursor);
  const start = { line: cursor.line, ch: token.start };
  const end = { line: cursor.line, ch: token.end };
  const completions = [
    "emitters",
    "x",
    "y",
    "direction",
    "spread",
    "speed",
    "particleLife",
    "color",
    "rate",
    "chain",
    "type",
    "burst",
    "followEmitter",
    "probability",
    "count",
    "life",
    "lifespan",
    "initialBurst",
  ];

  const list = completions.filter((item) => item.startsWith(token.string));
  return { list, from: start, to: end };
}

export function createEditor(textarea, { onApply, onChange } = {}) {
  const editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: { name: "javascript", json: true },
    theme: "material-darker",
    extraKeys: {
      "Ctrl-Space": "autocomplete",
      "Cmd-Space": "autocomplete",
      "Ctrl-Enter": () => onApply?.(),
      "Cmd-Enter": () => onApply?.(),
    },
    hintOptions: { hint: chainHint },
  });

  if (onChange) {
    editor.on("change", onChange);
  }

  return {
    getValue: () => editor.getValue(),
    setValue: (value) => editor.setValue(value),
    focus: () => editor.focus(),
    refresh: () => editor.refresh(),
  };
}
