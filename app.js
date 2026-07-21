const fallbackArticles = [
  { no: "01", title: "［文章标题 01］", section: "栏目", author: "作者", date: "日期", tone: "red", size: "feature", file: "content/articles/01.md" },
  { no: "02", title: "［文章标题 02］", section: "栏目", author: "作者", date: "日期", tone: "blue", size: "small", file: "content/articles/02.md" },
  { no: "03", title: "［文章标题 03］", section: "栏目", author: "作者", date: "日期", tone: "yellow", size: "small", file: "content/articles/03.md" },
  { no: "04", title: "［文章标题 04］", section: "栏目", author: "作者", date: "日期", tone: "black", size: "wide", file: "content/articles/04.md" },
  { no: "05", title: "［文章标题 05］", section: "栏目", author: "作者", date: "日期", tone: "blue", size: "small", file: "content/articles/05.md" },
  { no: "06", title: "［文章标题 06］", section: "栏目", author: "作者", date: "日期", tone: "red", size: "small", file: "content/articles/06.md" }
];

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
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

function articleCard(article, index) {
  const no = escapeHtml(article.no);
  return `
    <article class="article-card article-card--${escapeHtml(article.size)} tone-${escapeHtml(article.tone)}">
      <a class="article-link" href="#story-${no}" aria-label="打开文章 ${no}">
        <div class="card-no">${no}</div>
        <div class="card-art" aria-hidden="true">
          <span class="art-plane art-plane--one"></span>
          <span class="art-plane art-plane--two"></span>
          <span class="art-dots"></span>
          <span class="art-code">${String(index + 1).padStart(3, "0")}</span>
        </div>
        <div class="card-copy">
          <p class="card-kicker">ARTICLE / 文章</p>
          <h2>${escapeHtml(article.title)}</h2>
          <div class="card-meta"><span>${escapeHtml(article.section)} / SECTION</span><span>${escapeHtml(article.date)} / DATE</span></div>
        </div>
        <span class="card-arrow" aria-hidden="true">↗</span>
        <span class="registration-mark" aria-hidden="true"></span>
      </a>
    </article>`;
}

function storySlot(article, body) {
  const no = escapeHtml(article.no);
  return `
    <article class="story-slot" id="story-${no}">
      <div class="story-heading">
        <span class="story-no">${no}</span>
        <div><p>ARTICLE / 文章</p><h2>${escapeHtml(article.title)}</h2></div>
        <a href="#articles" aria-label="返回文章列表">↑</a>
      </div>
      <div class="story-fields">
        <span>${escapeHtml(article.author)} / AUTHOR</span>
        <span>${escapeHtml(article.date)} / DATE</span>
        <span>${escapeHtml(article.section)} / SECTION</span>
      </div>
      <div class="story-body">
        <div class="article-body">${body || '<div class="empty-copy" aria-label="正文待填写"><i></i><i></i><i></i><i></i><i></i></div>'}</div>
        <div class="story-graphic tone-${escapeHtml(article.tone)}" aria-hidden="true">
          <b>${no}</b><i></i><i></i><i></i>
        </div>
      </div>
    </article>`;
}

async function loadArticles() {
  try {
    const response = await fetch("content/articles.json", { cache: "no-store" });
    if (!response.ok) throw new Error("manifest unavailable");
    return await response.json();
  } catch (error) {
    console.warn("Using fallback article manifest", error);
    return fallbackArticles;
  }
}

async function loadArticleBody(article) {
  try {
    const response = await fetch(article.file, { cache: "no-store" });
    if (!response.ok) return "";
    return markdownToHtml(await response.text());
  } catch {
    return "";
  }
}

async function init() {
  const articles = await loadArticles();
  document.querySelector("#articles").innerHTML = articles.map(articleCard).join("");
  const bodies = await Promise.all(articles.map(loadArticleBody));
  document.querySelector("#story-slots").innerHTML = articles.map((article, index) => storySlot(article, bodies[index])).join("");
}

init();
