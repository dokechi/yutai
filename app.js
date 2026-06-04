const DATA_URL = 'data.json';

const state = {
  data: null,
  error: null,
  yutaiQuery: '',
  yutaiMonth: 'all',
};

const pages = {
  home: {
    title: '優待と暮らしのメモ',
    description: 'トップでは一覧を出さず、4つの入口から目的の情報へ進みます。',
  },
  yutai: {
    title: '1株優待',
    description: '少額で確認しやすい優待を、検索と権利月で絞り込めます。',
  },
  holdings: {
    title: '保有株',
    description: '損益は表示せず、取得単価・現在値・優待内容だけを確認します。',
  },
  costs: {
    title: '固定費',
    description: 'スマホ、保険、電気、サブスクなどの見直し候補を整理します。',
  },
  deals: {
    title: '安く買う',
    description: '価格、参考価格、単価、販売状態をさっと確認します。',
  },
};

const app = document.querySelector('#app');

init();

async function init() {
  renderLoading();

  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`data.json の取得に失敗しました（HTTP ${response.status}）`);
    }
    state.data = await response.json();
    state.error = null;
  } catch (error) {
    state.error = error;
  }

  window.addEventListener('hashchange', render);
  render();
}

function render() {
  const pageName = getPageName();
  document.title = `${pages[pageName].title} | 優待と暮らしのメモ`;

  if (pageName === 'home') {
    renderHome();
    return;
  }

  if (state.error) {
    renderDataError(state.error);
    return;
  }

  if (!state.data) {
    renderLoading();
    return;
  }

  if (pageName === 'yutai') renderYutai();
  if (pageName === 'holdings') renderHoldings();
  if (pageName === 'costs') renderCosts();
  if (pageName === 'deals') renderDeals();
}

function getPageName() {
  const hash = window.location.hash.replace('#', '');
  return Object.hasOwn(pages, hash) ? hash : 'home';
}

function renderHome() {
  const template = document.querySelector('#home-template');
  app.replaceChildren(template.content.cloneNode(true));
}

function renderLoading() {
  app.innerHTML = `
    <section class="notice">
      <h1>読み込み中です</h1>
      <p>data.json から公開データを取得しています。</p>
    </section>
  `;
}

function renderDataError(error) {
  app.innerHTML = `
    <section class="notice error">
      <h1>データを読み込めませんでした</h1>
      <p>${escapeHtml(error.message || 'data.json の形式または配置を確認してください。')}</p>
      <p>GitHub Pagesでは、index.html と同じ階層に data.json を置いてください。</p>
      <p><a class="official-link" href="#home">トップへ戻る</a></p>
    </section>
  `;
}

function renderPageShell(pageName, controlsHtml, contentHtml) {
  const page = pages[pageName];
  app.innerHTML = `
    <section class="page">
      <div class="page-top">
        <div class="page-title">
          <h1>${page.title}</h1>
          <p>${page.description}</p>
        </div>
        <a class="back-link" href="#home">トップへ</a>
      </div>
      ${controlsHtml || ''}
      ${contentHtml}
    </section>
  `;
}

function renderYutai() {
  const items = normalizeArray(state.data.yutaiItems);
  const months = [...new Set(items.map((item) => text(item.rightMonth)).filter(Boolean))].sort(compareMonth);
  const query = state.yutaiQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesQuery = !query || [item.name, item.code, item.benefit, item.rightMonth]
      .some((value) => text(value).toLowerCase().includes(query));
    const matchesMonth = state.yutaiMonth === 'all' || text(item.rightMonth) === state.yutaiMonth;
    return matchesQuery && matchesMonth;
  });

  renderPageShell(
    'yutai',
    `<form class="toolbar" id="yutai-filter">
      <input class="input" type="search" name="query" value="${escapeAttribute(state.yutaiQuery)}" placeholder="銘柄名・コード・優待内容で検索" aria-label="1株優待を検索">
      <select class="select" name="month" aria-label="権利月で絞り込み">
        <option value="all">すべての権利月</option>
        ${months.map((month) => `<option value="${escapeAttribute(month)}" ${month === state.yutaiMonth ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
      </select>
    </form>`,
    `<div class="list-grid">${filteredItems.length ? filteredItems.map(renderYutaiCard).join('') : renderEmpty('条件に合う1株優待がありません。')}</div>`,
  );

  document.querySelector('#yutai-filter').addEventListener('input', (event) => {
    const form = event.currentTarget;
    state.yutaiQuery = form.elements.query.value;
    state.yutaiMonth = form.elements.month.value;
    renderYutai();
  });
}

function renderYutaiCard(item) {
  return `
    <article class="item-card">
      <div class="item-head">
        <h2 class="item-title">${escapeHtml(text(item.name))}</h2>
        <span class="item-code">${escapeHtml(text(item.code))}</span>
      </div>
      <p class="description">${escapeHtml(text(item.benefit))}</p>
      <div class="meta-grid">
        ${renderMeta('権利月', item.rightMonth)}
        ${renderMeta('必要資金', item.requiredFunds)}
        ${renderMeta('確認日', item.checkedAt)}
      </div>
      ${item.officialUrl ? `<a class="official-link" href="${escapeAttribute(item.officialUrl)}" target="_blank" rel="noopener noreferrer">公式リンクを見る</a>` : ''}
    </article>
  `;
}

function renderHoldings() {
  const items = normalizeArray(state.data.ownerHoldings);
  renderPageShell(
    'holdings',
    '',
    `<div class="list-grid">${items.length ? items.map(renderHoldingCard).join('') : renderEmpty('保有株データがありません。')}</div>`,
  );
}

function renderHoldingCard(item) {
  return `
    <article class="item-card">
      <div class="item-head">
        <h2 class="item-title">${escapeHtml(text(item.name))}</h2>
        <span class="item-code">${escapeHtml(text(item.code))}</span>
      </div>
      <p class="description">${escapeHtml(text(item.benefit))}</p>
      <div class="meta-grid">
        ${renderMeta('取得単価', item.averageCost)}
        ${renderMeta('現在値', item.currentPrice)}
        ${renderMeta('保有株数', item.shares)}
        ${renderMeta('権利月', item.rightMonth)}
      </div>
      ${item.memo ? `<p class="description">${escapeHtml(text(item.memo))}</p>` : ''}
    </article>
  `;
}

function renderCosts() {
  const items = normalizeArray(state.data.fixedCostItems);
  renderPageShell(
    'costs',
    '',
    `<div class="list-grid">${items.length ? items.map(renderCostCard).join('') : renderEmpty('固定費データがありません。')}</div>`,
  );
}

function renderCostCard(item) {
  return `
    <article class="item-card">
      <div class="item-head">
        <h2 class="item-title">${escapeHtml(text(item.name || item.category))}</h2>
        <span class="item-code">${escapeHtml(text(item.category))}</span>
      </div>
      <div class="saving">
        <span>節約目安</span>
        <strong>${escapeHtml(text(item.savingEstimate))}</strong>
      </div>
      <p class="description">${escapeHtml(text(item.memo || item.description))}</p>
    </article>
  `;
}

function renderDeals() {
  const items = normalizeArray(state.data.dealItems);
  renderPageShell(
    'deals',
    '',
    `<div class="list-grid">${items.length ? items.map(renderDealCard).join('') : renderEmpty('買い物データがありません。')}</div>`,
  );
}

function renderDealCard(item) {
  const status = text(item.status || item.saleStatus);
  const isClosed = /終了|完売|停止|sold\s*out/i.test(status);

  return `
    <article class="item-card">
      <div class="item-head">
        <h2 class="item-title">${escapeHtml(text(item.name))}</h2>
        <span class="badge ${isClosed ? 'closed' : 'open'}">${escapeHtml(status || '販売中')}</span>
      </div>
      <div>
        ${item.isAd ? '<span class="badge pr">PR</span>' : ''}
      </div>
      <div class="meta-grid">
        ${renderMeta('価格', item.price)}
        ${renderMeta('参考価格', item.referencePrice)}
        ${renderMeta('1個あたり', item.unitPrice)}
        ${renderMeta('確認日', item.checkedAt)}
      </div>
    </article>
  `;
}

function renderMeta(label, value) {
  return `
    <div class="meta">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(text(value) || '-')}</strong>
    </div>
  `;
}

function renderEmpty(message) {
  return `<p class="panel empty">${escapeHtml(message)}</p>`;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return value === null || value === undefined ? '' : String(value);
}

function compareMonth(a, b) {
  return Number.parseInt(a, 10) - Number.parseInt(b, 10) || a.localeCompare(b, 'ja');
}

function escapeHtml(value) {
  return text(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
