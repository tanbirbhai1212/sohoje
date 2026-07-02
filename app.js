/*
 * সহজে — অ্যাপের মূল লজিক
 * রুট: #/            → হোম (সব শ্রেণি)
 *      #/class/5     → একটি শ্রেণির বিষয় তালিকা
 *      #/class/5/math → একটি বিষয়ের অধ্যায় ও প্রশ্ন-উত্তর
 *      #/search/...  → খোঁজার ফলাফল
 */

const DATA = (window.SOHOJE_DATA || []).slice().sort((a, b) => a.id - b.id);
const app = document.getElementById('app');

const GROUPS = [
  { name: 'প্রাথমিক স্তর', range: [1, 5], note: '১ম থেকে ৫ম শ্রেণি' },
  { name: 'মাধ্যমিক স্তর', range: [6, 10], note: '৬ষ্ঠ থেকে ১০ম শ্রেণি' },
  { name: 'উচ্চ মাধ্যমিক স্তর', range: [11, 12], note: '১১শ ও ১২শ শ্রেণি' },
];

const BN_DIGITS = { 0: '০', 1: '১', 2: '২', 3: '৩', 4: '৪', 5: '৫', 6: '৬', 7: '৭', 8: '৮', 9: '৯' };

function bn(number) {
  return String(number).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function findClass(classId) {
  return DATA.find((c) => c.id === Number(classId));
}

function findSubject(cls, subjectId) {
  return cls ? cls.subjects.find((s) => s.id === subjectId) : null;
}

function countQuestions(subject) {
  return subject.chapters.reduce((sum, ch) => sum + ch.qa.length, 0);
}

/* ---------- পেজ রেন্ডারিং ---------- */

function renderHome() {
  const groupsHtml = GROUPS.map((group) => {
    const classes = DATA.filter((c) => c.id >= group.range[0] && c.id <= group.range[1]);
    const cards = classes
      .map((cls) => {
        const totalQ = cls.subjects.reduce((sum, s) => sum + countQuestions(s), 0);
        return `
          <a class="class-card" href="#/class/${cls.id}">
            <span class="class-card__number">${bn(cls.id)}</span>
            <span class="class-card__name">${cls.name}</span>
            <span class="class-card__meta">${bn(cls.subjects.length)}টি বিষয় · ${bn(totalQ)}টি প্রশ্ন</span>
          </a>`;
      })
      .join('');
    return `
      <section class="group">
        <div class="group__heading">
          <h2>${group.name}</h2>
          <p>${group.note}</p>
        </div>
        <div class="class-grid">${cards}</div>
      </section>`;
  }).join('');

  app.innerHTML = `
    <section class="hero">
      <div class="hero__content">
        <p class="hero__badge">শিক্ষা সহজে, জ্ঞান নিশ্চিতভাবে</p>
        <h1>তোমার শ্রেণি বেছে নাও, সহজ ভাষায় প্রশ্ন-উত্তর পড়ো</h1>
        <p>
          ১ম থেকে ১২শ শ্রেণির শিক্ষার্থীদের জন্য বিষয় ও অধ্যায় অনুযায়ী সাজানো
          গুরুত্বপূর্ণ প্রশ্ন-উত্তর — সবকিছু বাংলায়।
        </p>
      </div>
    </section>
    <div class="page">
      <section class="intro">
        <div class="intro__card"><h3>📚 শ্রেণি অনুযায়ী</h3><p>প্রতিটি শ্রেণির জন্য আলাদা বিষয় ও অধ্যায়ভিত্তিক প্রশ্ন-উত্তর।</p></div>
        <div class="intro__card"><h3>🔍 সহজে খোঁজা</h3><p>উপরের খোঁজার ঘরে যেকোনো শব্দ লিখে প্রশ্ন খুঁজে নাও।</p></div>
        <div class="intro__card"><h3>✅ সহজ ভাষা</h3><p>প্রতিটি উত্তর সহজ ও পরিষ্কার বাংলায় লেখা, মুখস্থ নয় — বুঝে পড়ার জন্য।</p></div>
      </section>
      ${groupsHtml}
    </div>`;
}

function renderClass(classId) {
  const cls = findClass(classId);
  if (!cls) return renderNotFound();

  const subjects = cls.subjects
    .map(
      (s) => `
        <a class="subject-card" href="#/class/${cls.id}/${s.id}">
          <span class="subject-card__icon">${s.icon}</span>
          <span class="subject-card__name">${s.name}</span>
          <span class="subject-card__meta">${bn(s.chapters.length)}টি অধ্যায় · ${bn(countQuestions(s))}টি প্রশ্ন</span>
        </a>`
    )
    .join('');

  app.innerHTML = `
    <div class="page">
      <nav class="breadcrumb"><a href="#/">হোম</a> <span>›</span> <strong>${cls.name}</strong></nav>
      <header class="page__heading">
        <h1>${cls.name}</h1>
        <p>বিষয় বেছে নাও — প্রতিটি বিষয়ে অধ্যায় অনুযায়ী প্রশ্ন-উত্তর আছে।</p>
      </header>
      <div class="subject-grid">${subjects}</div>
      ${renderBooks(cls)}
      ${renderClassNav(cls.id)}
    </div>`;
}

function renderBooks(cls) {
  if (!cls.books) return '';
  const groups = cls.books.groups
    .map(
      (group) => `
        <div class="books__group">
          <h3>${group.name}</h3>
          <ul class="books__list">
            ${group.items.map((book) => `<li>📕 ${book}</li>`).join('')}
          </ul>
        </div>`
    )
    .join('');
  return `
    <section class="books">
      <h2>📚 অফিসিয়াল পাঠ্যবই (এনসিটিবি)</h2>
      <p class="books__intro">২০২৬ শিক্ষাবর্ষের জন্য জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ডের (এনসিটিবি) বই:</p>
      ${groups}
      ${cls.books.note ? `<p class="books__note">${cls.books.note}</p>` : ''}
      <a class="btn-download" href="${cls.books.url}" target="_blank" rel="noopener">
        ⬇️ সব বইয়ের পিডিএফ ডাউনলোড করো (এনসিটিবির ওয়েবসাইট)
      </a>
    </section>`;
}

function renderClassNav(currentId) {
  const links = DATA.map(
    (c) =>
      `<a class="chip ${c.id === currentId ? 'active' : ''}" href="#/class/${c.id}">${bn(c.id)}</a>`
  ).join('');
  return `
    <section class="class-nav">
      <p>অন্য শ্রেণিতে যাও:</p>
      <div class="class-nav__chips">${links}</div>
    </section>`;
}

function renderSubject(classId, subjectId) {
  const cls = findClass(classId);
  const subject = findSubject(cls, subjectId);
  if (!cls || !subject) return renderNotFound();

  const chapters = subject.chapters
    .map((ch, chIndex) => {
      const qaHtml = ch.qa
        .map(
          (item, qIndex) => `
            <details class="qa" ${chIndex === 0 && qIndex === 0 ? 'open' : ''}>
              <summary><span class="qa__label">প্রশ্ন ${bn(qIndex + 1)}:</span> ${escapeHtml(item.q)}</summary>
              <p><span class="qa__label qa__label--answer">উত্তর:</span> ${escapeHtml(item.a)}</p>
            </details>`
        )
        .join('');
      return `
        <section class="chapter">
          <h2><span class="chapter__number">অধ্যায় ${bn(chIndex + 1)}</span> ${ch.title}</h2>
          ${qaHtml}
        </section>`;
    })
    .join('');

  const otherSubjects = cls.subjects
    .filter((s) => s.id !== subject.id)
    .map((s) => `<a class="chip" href="#/class/${cls.id}/${s.id}">${s.icon} ${s.name}</a>`)
    .join('');

  app.innerHTML = `
    <div class="page">
      <nav class="breadcrumb">
        <a href="#/">হোম</a> <span>›</span>
        <a href="#/class/${cls.id}">${cls.name}</a> <span>›</span>
        <strong>${subject.name}</strong>
      </nav>
      <header class="page__heading">
        <h1>${subject.icon} ${subject.name} <small>(${cls.name})</small></h1>
        <p>প্রশ্নে ক্লিক করলে উত্তর দেখা যাবে।</p>
      </header>
      ${chapters}
      <section class="class-nav">
        <p>${cls.name}-এর অন্য বিষয়:</p>
        <div class="class-nav__chips">${otherSubjects}</div>
      </section>
    </div>`;
}

/* ---------- খোঁজা ---------- */

function searchAll(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const results = [];
  DATA.forEach((cls) => {
    cls.subjects.forEach((subject) => {
      subject.chapters.forEach((chapter) => {
        chapter.qa.forEach((item) => {
          const haystack = (item.q + ' ' + item.a + ' ' + chapter.title + ' ' + subject.name).toLowerCase();
          if (haystack.includes(needle)) {
            results.push({ cls, subject, chapter, item });
          }
        });
      });
    });
  });
  return results;
}

function renderSearch(rawQuery) {
  const query = decodeURIComponent(rawQuery || '');
  const results = searchAll(query);
  const input = document.getElementById('search-input');
  if (input) input.value = query;

  const resultsHtml = results.length
    ? results
        .map(
          (r) => `
            <article class="result">
              <p class="result__path">
                <a href="#/class/${r.cls.id}/${r.subject.id}">${r.cls.name} › ${r.subject.name} › ${escapeHtml(r.chapter.title)}</a>
              </p>
              <details class="qa" open>
                <summary><span class="qa__label">প্রশ্ন:</span> ${escapeHtml(r.item.q)}</summary>
                <p><span class="qa__label qa__label--answer">উত্তর:</span> ${escapeHtml(r.item.a)}</p>
              </details>
            </article>`
        )
        .join('')
    : `<p class="empty">দুঃখিত, “${escapeHtml(query)}” লিখে কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করো।</p>`;

  app.innerHTML = `
    <div class="page">
      <nav class="breadcrumb"><a href="#/">হোম</a> <span>›</span> <strong>খোঁজার ফলাফল</strong></nav>
      <header class="page__heading">
        <h1>খোঁজার ফলাফল</h1>
        <p>“${escapeHtml(query)}” লিখে ${bn(results.length)}টি প্রশ্ন পাওয়া গেছে।</p>
      </header>
      ${resultsHtml}
    </div>`;
}

function renderNotFound() {
  app.innerHTML = `
    <div class="page">
      <header class="page__heading">
        <h1>পাওয়া যায়নি</h1>
        <p>এই পাতাটি খুঁজে পাওয়া যায়নি। <a href="#/">হোমে ফিরে যাও</a>।</p>
      </header>
    </div>`;
}

/* ---------- রাউটার ---------- */

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) {
    renderHome();
  } else if (parts[0] === 'class' && parts.length === 2) {
    renderClass(parts[1]);
  } else if (parts[0] === 'class' && parts.length === 3) {
    renderSubject(parts[1], parts[2]);
  } else if (parts[0] === 'search') {
    renderSearch(parts.slice(1).join('/'));
  } else {
    renderNotFound();
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  if (query) location.hash = '#/search/' + encodeURIComponent(query);
});

document.getElementById('year').textContent = bn(new Date().getFullYear());

route();
