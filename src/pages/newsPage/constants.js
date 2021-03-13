export const ckEditorConfig = {
  toolbarGroups: [
    {
      name: "document",
      groups: ["mode", "document", "doctools"],
    },
    { name: "clipboard", groups: ["clipboard", "undo"] },
    {
      name: "editing",
      groups: ["find", "selection", "spellchecker", "editing"],
    },
    { name: "forms", groups: ["forms"] },

    { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
    {
      name: "paragraph",
      groups: ["list", "indent", "blocks", "align", "bidi", "paragraph"],
    },
    { name: "links", groups: ["links"] },
    { name: "insert", groups: ["insert"] },

    { name: "styles", groups: ["styles"] },
    { name: "colors", groups: ["colors"] },
    { name: "tools", groups: ["tools"] },
    { name: "others", groups: ["others"] },
    { name: "about", groups: ["about"] },
  ],
  removeButtons:
    "Subscript,Superscript,Save,NewPage,ExportPdf,Preview,Print,Templates,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Scayt,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,Outdent,Indent,CreateDiv,BidiLtr,BidiRtl,Language,Anchor,Image,Flash,Table,HorizontalRule,PageBreak,Iframe,ShowBlocks",
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
