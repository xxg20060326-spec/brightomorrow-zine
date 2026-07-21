(function () {
  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    })[char]);

  function inlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  function markdownToHtml(markdown) {
    const lines = markdown
      .replace(/<!--[\s\S]*?-->/g, "")
      .split(/\r?\n/);
    const output = [];
    let list = [];

    const flushList = () => {
      if (!list.length) return;
      output.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      list = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }
      if (trimmed.startsWith("### ")) {
        flushList();
        output.push(`<h4>${inlineMarkdown(trimmed.slice(4))}</h4>`);
      } else if (trimmed.startsWith("## ")) {
        flushList();
        output.push(`<h3>${inlineMarkdown(trimmed.slice(3))}</h3>`);
      } else if (trimmed.startsWith("# ")) {
        flushList();
        output.push(`<h2>${inlineMarkdown(trimmed.slice(2))}</h2>`);
      } else if (trimmed.startsWith("> ")) {
        flushList();
        output.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
      } else if (trimmed.startsWith("- ")) {
        list.push(trimmed.slice(2));
      } else {
        flushList();
        output.push(`<p>${inlineMarkdown(trimmed)}</p>`);
      }
    });
    flushList();
    return output.join("");
  }

  window.BTMarkdown = { escapeHtml, markdownToHtml };
})();
