export const configEditor = {
  readonly: false, // all options from https://xdsoft.net/jodit/doc/
  toolbarAdaptive: false,
  buttons: [
    // "source",
    // "|",
    "bold",
    "italic",
    "|",
    "ul",
    "ol",
    // "eraser",
    // "|",
    // "font",
    // "fontsize",
    // "brush",
    // "paragraph",
    // "|",
    // "align",
    "|",
    "undo",
    "redo",
    "|",
    // "hr",
    "fullsize",
  ],
};

export const optionsMed = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 800,
  useWebWorker: true,
};

export const optionsMin = {
  maxSizeMB: 1,
  maxWidthOrHeight: 100,
  useWebWorker: true,
};
