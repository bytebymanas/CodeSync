// This script runs in the page's MAIN world (not the isolated content script world).
// It can access page globals like `monaco` and `ace` to extract the full editor content.
// Communicates back to the content script via a CustomEvent.
(function () {
  let code = null;

  try {
    // Monaco editor (LeetCode)
    if (typeof monaco !== "undefined" && monaco.editor) {
      const models = monaco.editor.getModels();
      if (models.length > 0) {
        code = models[0].getValue();
      }
    }
  } catch (e) {
    // Monaco not available
  }

  try {
    // Ace editor (GFG)
    if (!code && typeof ace !== "undefined") {
      const editorEl = document.querySelector(".ace_editor");
      if (editorEl) {
        const editor = ace.edit(editorEl);
        if (editor) {
          code = editor.getValue();
        }
      }
    }
  } catch (e) {
    // Ace not available
  }

  document.dispatchEvent(
    new CustomEvent("__codesync_editor_code__", {
      detail: { code: code }
    })
  );
})();
