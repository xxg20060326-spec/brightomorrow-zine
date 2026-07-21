const fallbackArticles = [
  { no: "01", title: "［文章标题 01］", section: "栏目", author: "作者", date: "日期", tone: "red", size: "feature", file: "content/articles/01.md" },
  { no: "02", title: "［文章标题 02］", section: "栏目", author: "作者", date: "日期", tone: "blue", size: "small", file: "content/articles/02.md" },
  { no: "03", title: "［文章标题 03］", section: "栏目", author: "作者", date: "日期", tone: "yellow", size: "small", file: "content/articles/03.md" },
  { no: "04", title: "［文章标题 04］", section: "栏目", author: "作者", date: "日期", tone: "black", size: "wide", file: "content/articles/04.md" },
  { no: "05", title: "［文章标题 05］", section: "栏目", author: "作者", date: "日期", tone: "blue", size: "small", file: "content/articles/05.md" },
  { no: "06", title: "［文章标题 06］", section: "栏目", author: "作者", date: "日期", tone: "red", size: "small", file: "content/articles/06.md" }
];

const { escapeHtml } = window.BTMarkdown;

function articleCard(article, index) {
  const no = escapeHtml(article.no);
  return `
    <article class="article-card article-card--${escapeHtml(article.size)} tone-${escapeHtml(article.tone)}">
      <a class="article-link" href="article.html?id=${encodeURIComponent(article.no)}" aria-label="打开文章 ${no}">
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

async function init() {
  const articles = await loadArticles();
  document.querySelector("#articles").innerHTML = articles.map(articleCard).join("");
}

init();
