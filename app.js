const DATA_URL = 'data.json';

const state = {
  data: null,
  error: null,
  yutaiQuery: '',
  yutaiMonth: 'all',
  yutaiHideOld: false,
  yutaiOfficialOnly: false,
  holdingsSort: 'month',
  holdingsOfficialOnly: false,
  holdingsHideOld: true,
  costsSort: 'saving',
  costsHideDone: false,
  costsPayment: 'monthly',
  dealsQuery: '',
  dealsOnSaleOnly: true,
  dealsHideOld: true,
  dealsHidePr: false,
};

const pages = {
  home: {
    title: '優待と暮らしのメモ',
    description: '一覧を並べず、4つの入口から目的の情報へ進みます。',
    accent: 'blue',
  },
  yutai: {
    title: '1株優待',
    description: '少額で確認しやすい優待を、検索と権利月で絞り込みます。',
    accent: 'blue',
  },
  holdings: {
    title: '保有株',
    description: '損益は表示せず、取得単価・現在値・優待内容だけを確認します。',
    accent: 'green',
  },
  costs: {
    title: '固定費',
    description: 'スマホ、保険、電気、サブスクなどの見直し候補を整理します。',
    accent: 'orange',
  },
  deals: {
    title: '安く買う',
    description: '価格、参考価格、単価、販売状況をさっと確認します。',
    accent: 'red',
  },
};

const app = document.querySelector('#app');

init();

async function init() {
  renderLoading();

  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`data.json の取得に失敗しました（HTTP ${response.status}）`);
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
  app.innerHTML = `
    <section class="hero page-accent-blue">
      ${renderUpdated()}
      <p class="eyebrow">必要な入口だけ選ぶ</p>
      <h1>優待・保有株・固定費・安く買うを、迷わず確認。</h1>
      <p class="lead">一覧を並べず、4つの入口から目的の情報へ進みます。</p>
      <nav class="choice-grid" aria-label="カテゴリ選択">
        ${renderChoiceCard('01', '1株優待', '1株だけで取れる優待を見る', 'yutai', 'blue')}
        ${renderChoiceCard('02', '保有株', '持ってる株の優待・権利月を見る', 'holdings', 'green')}
        ${renderChoiceCard('03', '固定費', '毎月の支払いを減らす候補を見る', 'costs', 'orange')}
        ${renderChoiceCard('04', '安く買う', '今安いもの・販売状況を見る', 'deals', 'red')}
      </nav>
    </section>
  `;
}

function renderChoiceCard(number, title, description, hash, accent) {
  return `
    <a class="choice-card accent-${accent}" href="#${hash}">
      <span class="choice-kicker">${number}</span>
      <strong>${title}</strong>
      <small>${description}</small>
      <span class="choice-arrow" aria-hidden="true"></span>
    </a>
  `;
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

function renderPageShell(pageName, controlsHtml, contentHtml, options = {}) {
  const page = pages[pageName];
  app.innerHTML = `
    <section class="page page-${pageName} page-accent-${page.accent}">
      ${options.showUpdated ? renderUpdated() : ''}
      <div class="page-title">
        <h1>${page.title}</h1>
        <p>${page.description}</p>
      </div>
      <a class="back-link ${options.outlineBack ? 'is-outline' : ''}" href="#home">${options.backIcon ? '<span aria-hidden="true">←</span>' : ''}トップへ</a>
      ${controlsHtml || ''}
      ${contentHtml}
    </section>
  `;
}

function renderUpdated() {
  const raw = state.data?.summary?.lastUpdated || state.data?.settings?.last_updated || state.data?.generatedAt || '2026-06-09';
  const date = text(raw).slice(0, 10);
  return `<p class="updated"><span aria-hidden="true">◷</span> 最終更新 ${escapeHtml(date)}</p>`;
}

function renderYutai() {
  const items = normalizeArray(state.data.yutaiItems);
  const months = [...new Set(items.map((item) => text(item.recordMonth)).filter(Boolean))].sort(compareMonth);
  const query = state.yutaiQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesQuery = !query || [item.name, item.code, item.perk, item.recordMonth]
      .some((value) => text(value).toLowerCase().includes(query));
    const matchesMonth = state.yutaiMonth === 'all' || text(item.recordMonth) === state.yutaiMonth;
    const matchesOld = !state.yutaiHideOld || isCurrent(item);
    const matchesOfficial = !state.yutaiOfficialOnly || Boolean(item.officialUrl);
    return matchesQuery && matchesMonth && matchesOld && matchesOfficial;
  });

  renderPageShell(
    'yutai',
    `<form class="controls yutai-controls" id="yutai-filter">
      <label class="search-field"><span class="icon search-icon" aria-hidden="true"></span><input type="search" name="query" value="${escapeAttribute(state.yutaiQuery)}" placeholder="銘柄名・コード・優待内容で検索" aria-label="1株優待を検索"></label>
      <label class="select-field"><span class="icon calendar-icon" aria-hidden="true"></span><select name="month" aria-label="権利月で絞り込み">
        <option value="all">すべての権利月</option>
        ${months.map((month) => `<option value="${escapeAttribute(month)}" ${month === state.yutaiMonth ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
      </select><span class="chevron" aria-hidden="true"></span></label>
      <div class="toggle-panel">
        ${renderSwitch('hideOld', '古い情報を隠す', state.yutaiHideOld)}
        ${renderSwitch('officialOnly', '公式確認済だけ', state.yutaiOfficialOnly)}
      </div>
    </form>`,
    `<div class="card-list">${filteredItems.length ? filteredItems.map(renderYutaiCard).join('') : renderEmpty('条件に合う1株優待がありません。')}</div>`,
  );

  document.querySelector('#yutai-filter').addEventListener('input', onYutaiFilter);
}

function onYutaiFilter(event) {
  const form = event.currentTarget;
  state.yutaiQuery = form.elements.query.value;
  state.yutaiMonth = form.elements.month.value;
  state.yutaiHideOld = form.elements.hideOld.checked;
  state.yutaiOfficialOnly = form.elements.officialOnly.checked;
  renderYutai();
}

function renderYutaiCard(item) {
  const officialStatus = item.officialUrl ? '確認済' : '未確認';
  return `
    <article class="item-card yutai-card">
      <div class="item-head compact">
        <h2 class="item-title">${escapeHtml(text(item.name))}</h2>
        <span class="code-badge">${escapeHtml(text(item.code))}</span>
      </div>
      <p class="description">${escapeHtml(text(item.perk))}</p>
      <div class="meta-grid four">
        ${renderMeta('権利月', item.recordMonth, 'blue')}
        ${renderMeta('必要資金', formatYen(item.needMoneyYen), 'blue')}
        ${renderMeta('確認日', item.lastChecked, 'blue')}
        ${renderMeta('公式', officialStatus, 'blue')}
      </div>
      <div class="card-foot">
        ${item.officialUrl ? `<a class="official-link" href="${escapeAttribute(item.officialUrl)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span> 公式リンクを見る</a>` : '<span></span>'}
        ${item.memoPublic ? `<p class="memo">${escapeHtml(text(item.memoPublic))}</p>` : ''}
      </div>
    </article>
  `;
}

function renderHoldings() {
  const items = [...normalizeArray(state.data.ownerHoldings)]
    .filter((item) => !state.holdingsOfficialOnly || Boolean(item.officialUrl))
    .filter((item) => !state.holdingsHideOld || isCurrent(item));

  if (state.holdingsSort === 'code') {
    items.sort((a, b) => text(a.code).localeCompare(text(b.code), 'ja'));
  } else {
    items.sort((a, b) => compareMonth(text(a.recordMonth), text(b.recordMonth)));
  }

  renderPageShell(
    'holdings',
    `<form class="controls row-controls" id="holdings-filter">
      <label class="pill-control"><span class="icon calendar-icon" aria-hidden="true"></span><select name="sort"><option value="month" ${state.holdingsSort === 'month' ? 'selected' : ''}>権利月順</option><option value="code" ${state.holdingsSort === 'code' ? 'selected' : ''}>コード順</option></select><span class="chevron" aria-hidden="true"></span></label>
      <label class="pill-control"><span class="shield-icon" aria-hidden="true">♢</span><input type="checkbox" name="officialOnly" ${state.holdingsOfficialOnly ? 'checked' : ''}>公式確認済だけ</label>
      <label class="inline-switch">古い情報を隠す${renderSwitchOnly('hideOld', state.holdingsHideOld)}</label>
    </form>`,
    `<div class="card-list">${items.length ? items.map(renderHoldingCard).join('') : renderEmpty('保有株データがありません。')}</div>`,
  );

  document.querySelector('#holdings-filter').addEventListener('input', (event) => {
    const form = event.currentTarget;
    state.holdingsSort = form.elements.sort.value;
    state.holdingsOfficialOnly = form.elements.officialOnly.checked;
    state.holdingsHideOld = form.elements.hideOld.checked;
    renderHoldings();
  });
}

function renderHoldingCard(item) {
  const hasPerk = Boolean(text(item.perk).trim() || text(item.recordMonth).trim());
  return `
    <article class="item-card holding-card">
      <div class="holding-head">
        <span class="code-badge green">${escapeHtml(text(item.code))}</span>
        <div class="holding-title-block">
          <h2 class="item-title">${escapeHtml(text(item.name))}</h2>
          ${item.perk ? `<p class="perk-title">${escapeHtml(text(item.perk))}</p>` : '<p class="perk-title">優待内容を確認</p>'}
        </div>
        ${hasPerk ? '<span class="status-badge green">優待あり</span>' : ''}
      </div>
      <div class="meta-grid four soft-green">
        ${renderMeta('取得単価', formatYen(item.avgAcquisitionPriceYen))}
        ${renderMeta('現在値', formatYen(item.currentPriceYen))}
        ${renderMeta('保有株数', formatShares(item.ownedShares))}
        ${renderMeta('権利月', item.recordMonth || '-')}
      </div>
      ${item.memoPublic ? `<p class="description">${escapeHtml(text(item.memoPublic))}</p>` : '<p class="description">日常利用しやすい優待を中心に確認。</p>'}
    </article>
  `;
}

function renderCosts() {
  const items = [...normalizeArray(state.data.fixedCostItems)].sort((a, b) => (Number(b.saveMaxYen) || 0) - (Number(a.saveMaxYen) || 0));
  renderPageShell(
    'costs',
    `<form class="controls row-controls cost-controls" id="costs-filter">
      <label class="pill-control"><span aria-hidden="true">⇅</span><select name="sort"><option value="saving">大きい節約順</option></select><span class="chevron" aria-hidden="true"></span></label>
      <label class="pill-control"><span aria-hidden="true">◌</span><input type="checkbox" name="hideDone" ${state.costsHideDone ? 'checked' : ''}>済んだものを隠す</label>
      <label class="pill-control"><span aria-hidden="true">▣</span><select name="payment"><option value="monthly">毎月の支払い</option></select><span class="chevron" aria-hidden="true"></span></label>
    </form>`,
    `<div class="card-list">${items.length ? items.map(renderCostCard).join('') : renderEmpty('固定費データがありません。')}</div>`,
    { outlineBack: true, backIcon: true },
  );

  document.querySelector('#costs-filter').addEventListener('input', (event) => {
    state.costsHideDone = event.currentTarget.elements.hideDone.checked;
  });
}

function renderCostCard(item, index) {
  const steps = normalizeArray(item.steps);
  return `
    <article class="item-card cost-card">
      <div class="cost-head">
        <span class="number-badge">${String(index + 1).padStart(2, '0')}</span>
        <h2 class="item-title">${escapeHtml(text(item.title || item.category))}</h2>
        <span class="category-badge">${escapeHtml(text(item.category))}</span>
      </div>
      <div class="saving-block">
        <span>節約目安</span>
        <strong>${escapeHtml(formatMonthlySaving(item.saveMinYen, item.saveMaxYen))}</strong>
      </div>
      <div class="task-lines">
        <div><span>見るところ</span><p>${escapeHtml(steps[0] || text(item.description || item.memoPublic))}</p></div>
        <div><span>次にやること</span><p>${escapeHtml(steps[1] || steps[0] || '今の請求額を確認する')}</p></div>
      </div>
      ${item.memoPublic ? `<p class="hint"><span aria-hidden="true">♧</span>${escapeHtml(text(item.memoPublic))}</p>` : ''}
    </article>
  `;
}

function renderDeals() {
  const query = state.dealsQuery.trim().toLowerCase();
  const items = normalizeArray(state.data.dealItems).filter((item) => {
    const isSoldOut = toBoolean(item.isSoldOut);
    const matchesQuery = !query || [item.title, item.availability, item.memoPublic].some((value) => text(value).toLowerCase().includes(query));
    const matchesSale = !state.dealsOnSaleOnly || !isSoldOut;
    const matchesOld = !state.dealsHideOld || isCurrent(item);
    const matchesPr = !state.dealsHidePr || !toBoolean(item.isAd);
    return matchesQuery && matchesSale && matchesOld && matchesPr;
  });

  renderPageShell(
    'deals',
    `<form class="controls deals-controls" id="deals-filter">
      <label class="search-field"><span class="icon search-icon" aria-hidden="true"></span><input type="search" name="query" value="${escapeAttribute(state.dealsQuery)}" placeholder="商品名で検索" aria-label="商品名で検索"></label>
      <div class="switch-row">
        ${renderSwitch('onSaleOnly', '販売中のみ', state.dealsOnSaleOnly)}
        ${renderSwitch('hideOld', '古い情報を隠す', state.dealsHideOld)}
        ${renderSwitch('hidePr', 'PRを隠す', state.dealsHidePr)}
      </div>
    </form>`,
    `<div class="card-list">${items.length ? items.map(renderDealCard).join('') : renderEmpty('買い物データがありません。')}</div>`,
    { outlineBack: true, showUpdated: true },
  );

  document.querySelector('#deals-filter').addEventListener('input', (event) => {
    const form = event.currentTarget;
    state.dealsQuery = form.elements.query.value;
    state.dealsOnSaleOnly = form.elements.onSaleOnly.checked;
    state.dealsHideOld = form.elements.hideOld.checked;
    state.dealsHidePr = form.elements.hidePr.checked;
    renderDeals();
  });
}

function renderDealCard(item) {
  const availability = text(item.availability) || '販売中';
  const isSoldOut = toBoolean(item.isSoldOut);
  const isClosed = isSoldOut || /終了|停止|売り切れ/.test(availability);

  return `
    <article class="item-card deal-card">
      <div class="item-head deal-head">
        <div>
          <h2 class="item-title">${escapeHtml(text(item.title))}</h2>
          <div class="label-row">
            ${toBoolean(item.isAd) ? '<span class="mini-label pr">PR</span>' : ''}
            ${item.category ? `<span class="mini-label red">${escapeHtml(text(item.category))}</span>` : ''}
          </div>
        </div>
        <span class="status-badge ${isClosed ? 'red' : 'green'}">${escapeHtml(availability)}</span>
      </div>
      <div class="deal-table">
        ${renderDealCell('価格', formatYen(item.priceYen), 'large')}
        ${renderDealCell('参考価格', formatYen(item.referencePriceYen))}
        ${renderDealCell('1個あたり', formatYen(item.unitPriceYen))}
        ${renderDealCell('販売状態', availability, isClosed ? 'red' : 'green')}
        ${renderDealCell('売り切れ', isSoldOut ? 'はい' : 'いいえ', isSoldOut ? 'red' : '')}
        ${renderDealCell('確認日', item.lastChecked)}
      </div>
      ${item.memoPublic ? `<p class="description">${escapeHtml(text(item.memoPublic))}</p>` : ''}
    </article>
  `;
}

function renderSwitch(name, label, checked) {
  return `<label class="switch-field"><span>${label}</span>${renderSwitchOnly(name, checked)}</label>`;
}

function renderSwitchOnly(name, checked) {
  return `<input type="checkbox" name="${name}" ${checked ? 'checked' : ''}><i aria-hidden="true"></i>`;
}

function renderMeta(label, value, tone = '') {
  return `
    <div class="meta ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(text(value) || '-')}</strong>
    </div>
  `;
}

function renderDealCell(label, value, tone = '') {
  return `<div class="deal-cell ${tone}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(text(value) || '-')}</strong></div>`;
}

function renderEmpty(message) {
  return `<p class="notice empty">${escapeHtml(message)}</p>`;
}

function isCurrent(item) {
  return item.isActive === undefined || toBoolean(item.isActive);
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const valueText = text(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'はい'].includes(valueText);
}

function formatYen(value) {
  if (value === null || value === undefined || value === '') return '';
  const valueText = text(value);
  const number = Number(valueText.replace(/,/g, ''));
  if (Number.isFinite(number)) return `${number.toLocaleString('ja-JP')}円`;
  return valueText;
}

function formatShares(value) {
  if (value === null || value === undefined || value === '') return '';
  const valueText = text(value);
  const number = Number(valueText.replace(/,/g, ''));
  if (Number.isFinite(number)) return `${number.toLocaleString('ja-JP')}株`;
  return valueText;
}

function formatMonthlySaving(minYen, maxYen) {
  const min = formatYen(minYen);
  const max = formatYen(maxYen);
  if (min && max) return `月${min}〜${max}`;
  if (min || max) return `月${min || max}`;
  return '';
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
