const fallbackArticles = [
  { no: "01", title: "［文章标题 01］", section: "栏目", author: "作者", date: "日期", tone: "red", size: "feature", file: "content/articles/01.md" },
  { no: "02", title: "［文章标题 02］", section: "栏目", author: "作者", date: "日期", tone: "blue", size: "small", file: "content/articles/02.md" },
  { no: "03", title: "［文章标题 03］", section: "栏目", author: "作者", date: "日期", tone: "yellow", size: "small", file: "content/articles/03.md" },
  { no: "04", title: "［文章标题 04］", section: "栏目", author: "作者", date: "日期", tone: "black", size: "wide", file: "content/articles/04.md" },
  { no: "05", title: "［文章标题 05］", section: "栏目", author: "作者", date: "日期", tone: "blue", size: "small", file: "content/articles/05.md" },
  { no: "06", title: "［文章标题 06］", section: "栏目", author: "作者", date: "日期", tone: "red", size: "small", file: "content/articles/06.md" }
];

const { escapeHtml, markdownToHtml } = window.BTMarkdown;

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

async function loadMarkdown(file) {
  const response = await fetch(file, { cache: "no-store" });
  if (!response.ok) throw new Error("article unavailable");
  return await response.text();
}

function articleUrl(article) {
  return `article.html?id=${encodeURIComponent(article.no)}`;
}

function buildIssueNavigation(articles, activeNo) {
  const navigation = document.querySelector("#issue-navigation");
  navigation.innerHTML = articles.map((article) => `
    <li class="${article.no === activeNo ? "is-active" : ""}">
      <a href="${articleUrl(article)}">
        <span>${escapeHtml(article.no)}</span>
        <b>${escapeHtml(article.title)}</b>
      </a>
    </li>`).join("");
}

function buildToc() {
  const body = document.querySelector("#article-body");
  const toc = document.querySelector("#article-toc");
  const headings = [...body.querySelectorAll("h2, h3, h4")];

  if (!headings.length) {
    toc.innerHTML = '<li class="toc-empty">本文暂无分节</li>';
    return;
  }

  const usedIds = new Set();
  headings.forEach((heading, index) => {
    const base = `section-${index + 1}`;
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    heading.id = id;
  });

  toc.innerHTML = headings.map((heading, index) => `
    <li class="toc-level-${heading.tagName.toLowerCase()}">
      <a href="#${heading.id}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(heading.textContent)}</a>
    </li>`).join("");
}

function textMetrics(markdown) {
  const clean = markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/[#>*_\-\[\]]/g, " ")
    .trim();
  const chineseCharacters = (clean.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (clean.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  const count = chineseCharacters + latinWords;
  return {
    count,
    minutes: Math.max(1, Math.ceil(count / 350))
  };
}

function recordRows(article, metrics) {
  return [
    ["编号", `BT—01/${article.no}`],
    ["期号", "VOL.01 / 2026"],
    ["栏目", article.section],
    ["作者", article.author],
    ["日期", article.date],
    ["字数", `${metrics.count} 字`],
    ["阅读", `约 ${metrics.minutes} 分钟`]
  ];
}

function renderRecord(target, rows) {
  target.innerHTML = rows.map(([label, value]) => `
    <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
}

function setPagination(articles, currentIndex) {
  const previous = articles[currentIndex - 1];
  const next = articles[currentIndex + 1];
  const previousLink = document.querySelector("#previous-article");
  const nextLink = document.querySelector("#next-article");

  if (previous) {
    previousLink.href = articleUrl(previous);
    previousLink.querySelector("strong").textContent = `${previous.no} / ${previous.title}`;
  } else {
    previousLink.classList.add("is-disabled");
  }

  if (next) {
    nextLink.href = articleUrl(next);
    nextLink.querySelector("strong").textContent = `${next.no} / ${next.title}`;
  } else {
    nextLink.classList.add("is-disabled");
  }
}

function renderMissing(articles, requestedId) {
  document.title = "未找到文章 — BRIGHTomorrow";
  document.querySelector("#article-title").textContent = "没有找到这篇文章";
  document.querySelector("#article-byline").textContent = `REQUESTED RECORD / ${requestedId || "EMPTY"}`;
  document.querySelector("#article-body").innerHTML = `
    <div class="missing-record">
      <b>404 / RECORD NOT FOUND</b>
      <p>这个文章编号不存在，或者已经移动。</p>
      <a href="index.html#articles">返回文章索引 →</a>
    </div>`;
  buildIssueNavigation(articles, "");
  document.querySelector("#archive-layout").classList.add("is-missing");
}

async function initArticle() {
  const articles = await loadArticles();
  const requestedId = new URLSearchParams(window.location.search).get("id") || articles[0]?.no;
  const articleIndex = articles.findIndex((item) => item.no === requestedId);

  if (articleIndex < 0) {
    renderMissing(articles, requestedId);
    return;
  }

  const article = articles[articleIndex];
  const body = document.querySelector("#article-body");

  try {
    const markdown = await loadMarkdown(article.file);
    const metrics = textMetrics(markdown);
    const rows = recordRows(article, metrics);

    document.body.dataset.tone = article.tone;
    document.title = `${article.title} — BRIGHTomorrow`;
    document.querySelector("#article-title").textContent = article.title;
    document.querySelector("#article-byline").textContent = `${article.author} / ${article.section} / ${article.date}`;
    document.querySelector("#article-ghost-number").textContent = article.no;
    document.querySelector("#record-number").textContent = article.no;
    document.querySelector("#record-watermark").textContent = article.no;
    document.querySelector("#breadcrumb-number").textContent = `ARTICLE ${article.no}`;
    document.querySelector("#system-record").textContent = `RECORD / BT—01/${article.no}`;
    document.querySelector("#end-record").textContent = `BT—01/${article.no}`;
    body.innerHTML = markdownToHtml(markdown) || '<p class="empty-record">这篇文章还没有填写正文。</p>';

    renderRecord(document.querySelector("#article-record"), rows);
    renderRecord(document.querySelector("#mobile-record"), rows);
    buildIssueNavigation(articles, article.no);
    buildToc();
    setPagination(articles, articleIndex);
  } catch (error) {
    console.error(error);
    body.innerHTML = '<div class="missing-record"><b>LOAD ERROR</b><p>正文读取失败，请稍后刷新。</p></div>';
    buildIssueNavigation(articles, article.no);
  }
}

initArticle();
