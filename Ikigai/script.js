const API = 'http://localhost:3000';
const $ = id => document.getElementById(id);

// Парсинг базового markdown: **bold**, *italic*, `code`
function parseMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:rgba(168,85,247,0.15);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:.9em;">$1</code>')
        .replace(/\n/g, '<br>');
}

let currentUser = null;
let currentChatId = null;
let currentImageBase64 = null;
let isInterviewMode = false;

// --- THEME ---
const th = $('themeToggle'), iD = $('iconDark'), iL = $('iconLight');
let theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);
function applyTheme(t) { 
    iD.style.display = t === 'dark' ? '' : 'none'; 
    iL.style.display = t === 'light' ? '' : 'none'; 
}
applyTheme(theme);
th.onclick = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); 
    applyTheme(theme);
};

// --- AUTH ---
const authScr = $('authScreen'), appCont = $('appContainer');
document.querySelectorAll('.auth-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(x => x.classList.remove('active')); 
    t.classList.add('active');
    const m = t.dataset.auth;
    $('nameGroup').style.display = m === 'register' ? 'flex' : 'none';
    $('authName').required = m === 'register';
    $('authSubmitBtn').textContent = m === 'register' ? 'Создать аккаунт' : 'Войти';
    $('authError').style.display = 'none';
}));

$('authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('authEmail').value.trim().toLowerCase();
    const password = $('authPassword').value;
    const name = $('authName').value.trim();
    const mode = document.querySelector('.auth-tab.active').dataset.auth;

    try {
        const res = await fetch(`${API}/${mode}`, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        localStorage.setItem('session_email', email);
        await loginUser(email, data.name, data.coins, data.streak, data.avatar);
    } catch(err) {
        showErr(err.message);
    }
});

function showErr(m) { 
    $('authError').textContent = m; 
    $('authError').style.display = 'block'; 
}

async function loginUser(email, name, coins, streak, avatar) {
    currentUser = { email, name, coins, streak, avatar };
    authScr.style.opacity = '0';
    setTimeout(async () => {
        authScr.style.display = 'none';
        appCont.style.display = 'block';
        setTimeout(() => appCont.style.opacity = '1', 50);
        $('headerUserName').textContent = name;
        updateAvatarUI();
        $('streakCount').textContent = streak;
        
        await fetchUserData();
        loadChatList();
        updateDashFinance();
    }, 400);
}

$('profileLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('session_email'); 
    localStorage.removeItem('cached_name');
    currentUser = null;
    currentChatId = null;
    isInterviewMode = false;
    $('chatList').innerHTML = '';
    $('chatMessages').innerHTML = '<div class="typing-indicator" id="typingIndicator" style="display:none"><div class="msg-ava">🤖</div><div class="msg-text typing"><span></span><span></span><span></span></div></div>';
    
    $('profileModal').style.opacity = '0';
    setTimeout(() => $('profileModal').style.display = 'none', 300);
    appCont.style.opacity = '0';
    setTimeout(() => {
        appCont.style.display = 'none'; 
        authScr.style.display = 'flex';
        setTimeout(() => authScr.style.opacity = '1', 50);
        $('authEmail').value = ''; 
        $('authPassword').value = '';
    }, 400);
});

// Profile Modal Logic
$('openProfileBtn').addEventListener('click', () => {
    if (!currentUser) return;
    $('profName').textContent = currentUser.name || 'Пользователь';
    $('profEmail').textContent = currentUser.email;
    updateAvatarUI();
    $('profCoins').textContent = currentUser.coins;
    $('profStreak').textContent = currentUser.streak;
    $('profQuests').textContent = userQuests ? userQuests.length : 0;
    $('profShop').textContent = userShop ? userShop.length : 0;
    
    $('profileModal').style.display = 'flex';
    setTimeout(() => $('profileModal').style.opacity = '1', 10);
});
$('profileModalClose').addEventListener('click', () => {
    $('profileModal').style.opacity = '0';
    setTimeout(() => $('profileModal').style.display = 'none', 300);
});

// Auto-login & Fetch Data
window.addEventListener('DOMContentLoaded', async () => {
    const s = localStorage.getItem('session_email');
    if (s) {
        const cachedName = localStorage.getItem('cached_name') || 'Пользователь';
        currentUser = { email: s, name: cachedName, coins: 0, streak: 1 };
        await loginUser(s, cachedName, 0, 1);
    } else {
        authScr.style.display = 'flex'; 
        authScr.style.opacity = '1';
    }
    updateDashFinance();
});

let userQuests = [], userShop = [];
async function fetchUserData() {
    if(!currentUser) return;
    try {
        const r = await fetch(`${API}/api/user/${currentUser.email}`);
        const d = await r.json();
        
        // Если старая сессия, а в базе SQLite юзера нет -> разлогиниваем
        if(d.error) {
            $('profileLogoutBtn').click();
            return;
        }

        currentUser.name = d.name || currentUser.name || 'Пользователь';
        currentUser.avatar = d.avatar || currentUser.avatar || null;
        currentUser.coins = d.coins || 0; 
        currentUser.streak = d.streak || 1;
        userQuests = d.quests || []; 
        userShop = d.shop || [];
        
        localStorage.setItem('cached_name', currentUser.name);
        
        $('headerUserName').textContent = currentUser.name;
        updateAvatarUI();
        $('coinCount').textContent = currentUser.coins;
        $('streakCount').textContent = currentUser.streak;
        if($('shopCoinDisplay')) $('shopCoinDisplay').textContent = currentUser.coins;
        
        renderQuests(); 
        renderShop();
    } catch(e) {
        console.error("Ошибка загрузки данных пользователя:", e);
    }
}

function updateAvatarUI() {
    if(!currentUser) return;
    const initial = currentUser.name ? currentUser.name[0].toUpperCase() : 'U';
    const content = currentUser.avatar ? `<img src="${currentUser.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : initial;
    $('headerAvatar').innerHTML = content;
    $('profAvatar').innerHTML = content;
}

$('avatarUpload').addEventListener('change', async e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
        const base64 = ev.target.result;
        try {
            const r = await fetch(`${API}/api/user/avatar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: currentUser.email, avatar: base64 })
            });
            const d = await r.json();
            if(d.success) {
                currentUser.avatar = base64;
                updateAvatarUI();
            }
        } catch(e) { console.error(e); }
    };
    reader.readAsDataURL(file);
});

function addCoinsAnim(n) {
    currentUser.coins += n; 
    $('coinCount').textContent = currentUser.coins;
    const el = $('coinBalance'), fly = document.createElement('span');
    fly.className = 'coin-fly'; 
    fly.textContent = '+' + n;
    el.appendChild(fly); 
    setTimeout(() => fly.remove(), 900);
}

// --- TABS ---
document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => {
    if(b.classList.contains('auth-tab')) return;
    document.querySelectorAll('.nav-btn:not(.auth-tab)').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(x => {
        x.style.opacity = '0'; 
        setTimeout(() => x.classList.remove('active'), 300);
    });
    b.classList.add('active');
    setTimeout(() => {
        const target = $(b.dataset.target); 
        target.classList.add('active');
        setTimeout(() => target.style.opacity = '1', 50);
        if(b.dataset.target === 'dashboard') { loadHHStats(); updateDashFinance(); }
        if(b.dataset.target === 'finance') loadWallet();
    }, 300);
}));

// --- DASHBOARD (HH.kz) ---
async function loadHHStats(q = "Junior Backend Казахстан") {
    $('hhCount').textContent = "...";
    try {
        const r = await fetch(`${API}/api/vacancies?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        $('hhCount').textContent = d.count;
        $('hhTitle').textContent = `Открытых вакансий: ${q}`;
    } catch(e) { 
        $('hhCount').textContent = "н/д"; 
    }
}

// ====== WALLET / FINANCE ======

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const INCOME_ICONS = { salary:'💼', stipend:'🎓', freelance:'💻', parents:'👨‍👩‍👧', grant:'🏆', other:'✨' };
const INCOME_NAMES = { salary:'Зарплата', stipend:'Стипендия', freelance:'Фриланс', parents:'Помощь родителей', grant:'Грант', other:'Другое' };
const EXP_ICONS   = { food:'🍔', transport:'🚌', rent:'🏠', education:'📚', entertainment:'🎮', clothes:'👕', health:'💊', subscriptions:'📱', other:'📦' };
const EXP_NAMES   = { food:'Еда', transport:'Транспорт', rent:'Аренда', education:'Учёба', entertainment:'Развлечения', clothes:'Одежда', health:'Здоровье', subscriptions:'Подписки', other:'Другое' };
const CAT_COLORS  = ['#a855f7','#6d28d9','#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];

let walletMonth, walletYear, walletData = null;

function fmt(n) { return Number(n || 0).toLocaleString('ru-RU') + ' ₸'; }
function fmtDiff(cur, prev) {
    if (!prev) return '';
    const d = cur - prev, pct = Math.round(Math.abs(d) / prev * 100);
    return d >= 0
        ? `<span class="wstat-diff up">▲ ${fmt(d)} vs прошлый мес.</span>`
        : `<span class="wstat-diff down">▼ ${fmt(Math.abs(d))} vs прошлый мес.</span>`;
}

async function loadWallet() {
    if (!currentUser) return;
    const now = new Date();
    if (!walletMonth) { walletMonth = now.getMonth() + 1; walletYear = now.getFullYear(); }
    updateMonthLabel();
    // Set default date for expense
    const ed = $('expenseDate');
    if (ed) ed.value = now.toISOString().split('T')[0];

    try {
        const r = await fetch(`${API}/api/finance/${currentUser.email}?month=${walletMonth}&year=${walletYear}`);
        walletData = await r.json();
        renderWallet();
    } catch(e) { console.error('Ошибка загрузки кошелька:', e); }
}

function updateMonthLabel() {
    const lbl = $('currentMonthLabel');
    if (lbl) lbl.textContent = `${MONTHS_RU[walletMonth-1]} ${walletYear}`;
}

function renderWallet() {
    if (!walletData) return;
    const { incomes, expenses, prevIncome, prevExpenses } = walletData;

    const totalIncome   = incomes.reduce((s, i) => s + (i.amount||0), 0);
    const totalExpenses = expenses.reduce((s, i) => s + (i.amount||0), 0);
    const balance       = totalIncome - totalExpenses;

    // Days remaining in current month (or 0 if past month)
    const now = new Date();
    const isCurrentMonth = walletMonth === (now.getMonth()+1) && walletYear === now.getFullYear();
    const daysLeft = isCurrentMonth
        ? new Date(walletYear, walletMonth, 0).getDate() - now.getDate() + 1
        : 0;
    const dailyLimit = daysLeft > 0 && balance > 0 ? Math.floor(balance / daysLeft) : 0;

    $('wTotalIncome').textContent   = fmt(totalIncome);
    $('wTotalExpenses').textContent = fmt(totalExpenses);
    $('wBalance').textContent       = fmt(balance);
    $('wDailyLimit').textContent    = dailyLimit > 0 ? fmt(dailyLimit) : '—';
    $('wIncomeDiff').innerHTML      = fmtDiff(totalIncome, prevIncome);
    $('wExpensesDiff').innerHTML    = fmtDiff(totalExpenses, prevExpenses);
    $('wDaysLeft').textContent      = daysLeft > 0 ? `Осталось дней: ${daysLeft}` : (isCurrentMonth ? 'Последний день!' : 'Прошедший месяц');

    const pct = totalIncome > 0 ? Math.min(100, Math.round(balance / totalIncome * 100)) : 0;
    $('wBalanceFill').style.width = pct + '%';

    renderIncomeList(incomes);
    renderExpenseList(expenses);
    renderCategoryBars(expenses, totalExpenses);
    updateDashFinance();
}

function updateDashFinance() {
    if (!walletData) {
        // Если данных нет, пробуем загрузить для текущего месяца
        if (currentUser && !walletMonth) {
            const now = new Date();
            walletMonth = now.getMonth() + 1;
            walletYear = now.getFullYear();
            loadWallet(); // Это само вызовет updateDashFinance после загрузки
        }
        return;
    }

    const { incomes, expenses } = walletData;
    const totalIn  = incomes.reduce((s,i) => s + (i.amount||0), 0);
    const totalOut = expenses.reduce((s,e) => s + (e.amount||0), 0);
    const balance = totalIn - totalOut;

    const incomeEl = $('dashTotalIncome');
    const expenseEl = $('dashTotalExpenses');
    const barEl = $('dashFinanceBar');
    const noteEl = $('dashFinanceNote');

    if (incomeEl) incomeEl.textContent = fmt(totalIn);
    if (expenseEl) expenseEl.textContent = `-${fmt(totalOut)}`;
    
    const pct = totalIn > 0 ? Math.min(100, Math.round(balance / totalIn * 100)) : 0;
    if (barEl) barEl.style.width = pct + '%';
    
    if (noteEl) {
        if (balance > 0) {
            noteEl.textContent = `Свободно: ${fmt(balance)}. Отличный результат!`;
            noteEl.style.color = 'var(--text2)';
        } else if (balance < 0) {
            noteEl.textContent = `Перерасход: ${fmt(Math.abs(balance))}. Будь осторожнее!`;
            noteEl.style.color = 'var(--danger)';
        } else {
            noteEl.textContent = `Баланс нулевой. Добавь доходы или расходы.`;
            noteEl.style.color = 'var(--text2)';
        }
    }
}

function renderIncomeList(incomes) {
    const el = $('incomeList');
    if (!incomes.length) { el.innerHTML = '<div class="wallet-empty">Нет доходов за этот месяц</div>'; return; }
    el.innerHTML = incomes.map(i => `
        <div class="wallet-item">
            <div class="wallet-item-left">
                <div class="wallet-item-icon" style="background:rgba(16,185,129,0.12)">${INCOME_ICONS[i.source]||'✨'}</div>
                <div>
                    <div class="wallet-item-name">${INCOME_NAMES[i.source]||i.source}</div>
                    <div class="wallet-item-note">${i.note||''}</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="wallet-item-amount income-amt">+${fmt(i.amount)}</div>
                <button class="wallet-item-del" onclick="deleteIncome(${i.id})">✕</button>
            </div>
        </div>`).join('');
}

function renderExpenseList(expenses) {
    const el = $('expenseList');
    if (!expenses.length) { el.innerHTML = '<div class="wallet-empty">Нет расходов за этот месяц</div>'; return; }
    el.innerHTML = expenses.map(e => `
        <div class="wallet-item">
            <div class="wallet-item-left">
                <div class="wallet-item-icon" style="background:rgba(239,68,68,0.1)">${EXP_ICONS[e.category]||'📦'}</div>
                <div>
                    <div class="wallet-item-name">${EXP_NAMES[e.category]||e.category}${e.description ? ' · '+e.description : ''}</div>
                    <div class="wallet-item-date">${e.date||''}</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="wallet-item-amount expense-amt">-${fmt(e.amount)}</div>
                <button class="wallet-item-del" onclick="deleteExpense(${e.id})">✕</button>
            </div>
        </div>`).join('');
}

function renderCategoryBars(expenses, total) {
    const el = $('categoryBreakdown');
    if (!expenses.length) { el.innerHTML = '<div class="cat-empty">Добавь расходы, чтобы увидеть разбивку</div>'; return; }
    const cats = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category]||0) + (e.amount||0); });
    const sorted = Object.entries(cats).sort((a,b) => b[1]-a[1]);
    el.innerHTML = sorted.map(([cat, amt], i) => {
        const pct = total > 0 ? Math.round(amt/total*100) : 0;
        return `<div class="cat-bar-row">
            <div class="cat-bar-label">${EXP_ICONS[cat]||'📦'} ${EXP_NAMES[cat]||cat}</div>
            <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%;background:${CAT_COLORS[i%CAT_COLORS.length]}"></div></div>
            <div class="cat-bar-amount">${fmt(amt)}</div>
            <div class="cat-bar-pct">${pct}%</div>
        </div>`;
    }).join('');
}

async function deleteIncome(id) {
    await fetch(`${API}/api/finance/income/${id}`, { method: 'DELETE' });
    loadWallet();
}
async function deleteExpense(id) {
    await fetch(`${API}/api/finance/expense/${id}`, { method: 'DELETE' });
    loadWallet();
}

// Month navigation
$('prevMonthBtn').addEventListener('click', () => {
    walletMonth--;
    if (walletMonth < 1) { walletMonth = 12; walletYear--; }
    loadWallet();
});
$('nextMonthBtn').addEventListener('click', () => {
    walletMonth++;
    if (walletMonth > 12) { walletMonth = 1; walletYear++; }
    loadWallet();
});

// Income form
$('addIncomeBtn').addEventListener('click', () => {
    const f = $('addIncomeForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
});
$('cancelIncomeBtn').addEventListener('click', () => { $('addIncomeForm').style.display = 'none'; });
$('saveIncomeBtn').addEventListener('click', async () => {
    const amount = parseInt($('incomeAmount').value);
    if (!amount || amount <= 0) return alert('Укажи сумму!');
    await fetch(`${API}/api/finance/income`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: currentUser.email, source: $('incomeSource').value, amount, note: $('incomeNote').value, month: walletMonth, year: walletYear })
    });
    $('incomeAmount').value = ''; $('incomeNote').value = '';
    $('addIncomeForm').style.display = 'none';
    loadWallet();
});

// Expense form
$('addExpenseBtn').addEventListener('click', () => {
    const f = $('addExpenseForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
});
$('cancelExpenseBtn').addEventListener('click', () => { $('addExpenseForm').style.display = 'none'; });
$('saveExpenseBtn').addEventListener('click', async () => {
    const amount = parseInt($('expenseAmount').value);
    if (!amount || amount <= 0) return alert('Укажи сумму!');
    const date = $('expenseDate').value || new Date().toISOString().split('T')[0];
    await fetch(`${API}/api/finance/expense`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: currentUser.email, category: $('expenseCategory').value, amount, description: $('expenseDesc').value, date })
    });
    $('expenseAmount').value = ''; $('expenseDesc').value = '';
    $('addExpenseForm').style.display = 'none';
    loadWallet();
});

// AI budget analysis
$('calcFinanceBtn').addEventListener('click', () => {
    if (!walletData) return;
    const { incomes, expenses } = walletData;
    const totalIn  = incomes.reduce((s,i) => s+(i.amount||0), 0);
    const totalOut = expenses.reduce((s,e) => s+(e.amount||0), 0);
    const cats = {};
    expenses.forEach(e => { cats[EXP_NAMES[e.category]||e.category] = (cats[EXP_NAMES[e.category]||e.category]||0)+(e.amount||0); });
    const catStr = Object.entries(cats).map(([k,v]) => `${k}: ${v} ₸`).join(', ');
    const prompt = `Проанализируй мой бюджет за ${MONTHS_RU[walletMonth-1]} ${walletYear}. Доходы: ${totalIn} ₸. Расходы: ${totalOut} ₸ (${catStr||'не указаны'}). Остаток: ${totalIn-totalOut} ₸. Дай конкретные советы по оптимизации расходов, на чём можно сэкономить, и как лучше распределить оставшиеся деньги. Отвечай по-русски, структурированно.`;
    const res = $('financeResult');
    res.style.display = 'block';
    res.innerHTML = '<p>⏳ Хоши-AI анализирует твой бюджет...</p>';
    fetch(`${API}/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: currentUser.email, message: prompt }) })
        .then(r => r.json()).then(d => {
            res.innerHTML = `<h3 style="margin-bottom:12px">🤖 Анализ от Хоши-AI</h3><div class="ai-output">${parseMarkdown(d.reply)}</div>`;
        }).catch(() => { res.innerHTML = '<p style="color:var(--danger)">Ошибка генерации</p>'; });
});

$('buildPortfolioBtn').addEventListener('click', () => {
    const olimp = $('portfOlimp').value.trim();
    const volun = $('portfVolun').value.trim();
    const hobby = $('portfHobby').value.trim();
    if (!olimp && !volun && !hobby) return alert('Заполни хотя бы одно поле!');
    
    $('portfolioResult').style.display = 'block';
    $('portfolioResult').innerHTML = `<p>⏳ Упаковываем твои таланты в корпоративное портфолио...</p>`;
    
    const p = `Преврати эти школьные достижения в профессиональное резюме. Олимпиады: ${olimp}. Волонтерство: ${volun}. Хобби: ${hobby}. Напиши мощный Summary и опиши достижения профессиональным языком (например, soft skills, event management).`;
    
    fetch(`${API}/chat`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: currentUser.email, message: p })
    }).then(r => r.json()).then(d => {
        $('portfolioResult').innerHTML = `<h3>🏆 Готовое портфолио</h3><div class="ai-output" style="margin-top:10px">${parseMarkdown(d.reply)}</div>`;
    }).catch(e => {
        $('portfolioResult').innerHTML = `<p style="color:var(--danger)">Ошибка генерации</p>`;
    });
});

// --- PROFTEST & ROADMAP ---
const Qs = [
    { q:'В свободное время ты скорее:', o:[{t:'Копаешься в коде',i:'💻',g:'backend'}, {t:'Рисуешь',i:'🎨',g:'design'}, {t:'Изучаешь ИИ',i:'🤖',g:'ai'}, {t:'Смотришь про бизнес',i:'📈',g:'pm'}] },
    { q:'Как ты решаешь проблемы?', o:[{t:'Логический план',i:'📋',g:'backend'}, {t:'Креативный подход',i:'✨',g:'design'}, {t:'Аналитика и паттерны',i:'📊',g:'ai'}, {t:'Делегирую',i:'🤝',g:'pm'}] },
    { q:'Что бесит в приложениях?', o:[{t:'Баги и лаги',i:'🐛',g:'backend'}, {t:'Уродливый интерфейс',i:'🤮',g:'design'}, {t:'Глупый поиск',i:'🤦‍♂️',g:'ai'}, {t:'Лишние функции',i:'🗑️',g:'pm'}] }
];
const tagN = { design:'UX/UI Дизайнер', backend:'Backend Разработчик', ai:'AI Engineer', pm:'Product Manager' };
let qi = 0, ans = [];

$('startTestBtn').addEventListener('click', () => { 
    qi = 0; 
    ans = []; 
    showScreen('testQuiz'); 
    renderQ(); 
});

function showScreen(id) { 
    document.querySelectorAll('.test-screen').forEach(s => { 
        s.style.opacity = '0'; 
        setTimeout(() => { 
            s.classList.remove('active'); 
            if(s.id === id){ 
                s.classList.add('active'); 
                setTimeout(() => s.style.opacity = '1', 50); 
            } 
        }, 300); 
    }); 
}

function renderQ() {
    const q = Qs[qi]; 
    $('qCounter').textContent = 'Вопрос ' + (qi + 1) + ' из ' + Qs.length;
    $('progressFill').style.width = (qi / Qs.length * 100) + '%'; 
    $('questionText').textContent = q.q;
    const g = $('optionsGrid'); 
    g.innerHTML = '';
    q.o.forEach(o => {
        const d = document.createElement('div'); 
        d.className = 'option-card';
        d.innerHTML = `<div class="opt-icon">${o.i}</div><div class="opt-text">${o.t}</div>`;
        d.addEventListener('click', () => { 
            ans.push(o.g); 
            qi++; 
            if (qi < Qs.length) { 
                const s = $('testQuiz'); 
                s.style.opacity = '0'; 
                setTimeout(() => { renderQ(); s.style.opacity = '1'; }, 300); 
            } else {
                finishTest(); 
            }
        }); 
        g.appendChild(d);
    });
}

let testResultLabel = "";
async function finishTest() {
    $('progressFill').style.width = '100%'; 
    showScreen('testResult');
    const cnt = {}; 
    ans.forEach(t => { cnt[t] = (cnt[t] || 0) + 1; });
    const top = Object.entries(cnt).sort((a,b) => b[1] - a[1])[0][0];
    testResultLabel = tagN[top] || 'Full-Stack';
    
    await fetch(`${API}/api/action`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ email: currentUser.email, type: 'quest', id: 'proftest_' + Date.now(), reward: 100 }) 
    });
    addCoinsAnim(100);
    $('generateRoadmapBtn').style.display = 'inline-block';
}

$('generateRoadmapBtn').addEventListener('click', () => {
    $('roadmapContainer').style.display = 'block';
    $('roadmapContainer').innerHTML = `<p>⏳ Генерируем пошаговый Roadmap для профессии: <b>${testResultLabel}</b>...</p>`;
    
    fetch(`${API}/chat`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: currentUser.email, message: `Сгенерируй пошаговый roadmap (на 6 месяцев) для ${testResultLabel}. Сделай пунктами (Месяц 1: ... Месяц 2: ...)` })
    }).then(r => r.json()).then(d => {
        const html = parseMarkdown(d.reply);
        $('roadmapContainer').innerHTML = `<h3>🚀 Твой Roadmap (${testResultLabel})</h3><div class="ai-output" style="margin-top:10px">${html}</div>`;
    }).catch(e => {
        $('roadmapContainer').innerHTML = `<p style="color:red">Ошибка генерации</p>`;
    });
});

// --- MULTIMODAL CHAT ---
$('imageUpload').addEventListener('change', e => {
    const file = e.target.files[0]; 
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        currentImageBase64 = ev.target.result;
        $('imagePreview').src = currentImageBase64;
        $('imagePreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(file);
});

$('removeImageBtn').addEventListener('click', () => {
    currentImageBase64 = null; 
    $('imagePreview').src = '';
    $('imagePreviewContainer').style.display = 'none';
    $('imageUpload').value = '';
});

$('interviewModeBtn').addEventListener('click', () => {
    isInterviewMode = !isInterviewMode;
    $('interviewModeBtn').style.background = isInterviewMode ? 'var(--accent-purple)' : 'transparent';
    $('interviewModeBtn').style.color = isInterviewMode ? '#fff' : 'var(--text)';
    startNewChat();
    if(isInterviewMode) {
        addMsgToDOM('HR: Добрый день. Я готов провести ваше собеседование. Расскажите немного о себе и своем опыте.', 'mentor');
    }
});

async function loadChatList() {
    const r = await fetch(`${API}/api/chats/${currentUser.email}`);
    const chats = await r.json();
    const cl = $('chatList'); 
    cl.innerHTML = '';
    chats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'btn-ghost'; 
        btn.style.justifyContent = 'flex-start'; 
        btn.style.fontSize = '.85rem';
        btn.innerHTML = (c.is_interview ? '🎙️ ' : '💬 ') + c.title;
        btn.onclick = () => loadChatHistory(c.id, c.is_interview);
        cl.appendChild(btn);
    });
}
$('newChatBtn').addEventListener('click', () => {
    isInterviewMode = false;
    $('interviewModeBtn').style.background = 'transparent';
    $('interviewModeBtn').style.color = 'var(--text)';
    startNewChat();
});

function startNewChat() {
    currentChatId = null;
    $('chatMessages').innerHTML = '<div class="typing-indicator" id="typingIndicator" style="display:none"><div class="msg-ava">🤖</div><div class="msg-text typing"><span></span><span></span><span></span></div></div>';
    if(!isInterviewMode) {
        addMsgToDOM('Салем! Я <strong>Хоши-AI</strong> — твой персональный ментор ✦ Сохраняю историю наших разговоров.', 'mentor');
    }
}

async function loadChatHistory(id, isInt) {
    currentChatId = id; 
    isInterviewMode = isInt;
    $('interviewModeBtn').style.background = isInt ? 'var(--accent-purple)' : 'transparent';
    $('interviewModeBtn').style.color = isInt ? '#fff' : 'var(--text)';
    $('chatMessages').innerHTML = '<div class="typing-indicator" id="typingIndicator" style="display:none"><div class="msg-ava">🤖</div><div class="msg-text typing"><span></span><span></span><span></span></div></div>';
    
    const r = await fetch(`${API}/api/chats/messages/${id}`);
    const msgs = await r.json();
    msgs.forEach(m => {
        if(m.role === 'system') return;
        const isUser = m.role === 'user';
        let txt = "";
        if(Array.isArray(m.content)) {
            txt = m.content.find(x => x.type === 'text')?.text || "[Изображение]";
        } else {
            txt = m.content;
        }
        addMsgToDOM(isUser ? txt.replace(/\n/g, '<br>') : parseMarkdown(txt), isUser ? 'user' : 'mentor');
    });
}

async function sendAI(hiddenPrompt, displayText) {
    let finalPrompt = hiddenPrompt;
    if (!displayText) {
        const inp = $('userInput'); 
        displayText = inp.value.trim();
        if (!displayText && !currentImageBase64) return;
        finalPrompt = displayText;
        inp.value = '';
    }
    
    addMsgToDOM(displayText || '[Изображение]', 'user');
    showType(true);

    const payload = {
        email: currentUser.email,
        chatId: currentChatId,
        message: finalPrompt,
        image: currentImageBase64,
        isInterview: isInterviewMode
    };

    try {
        const r = await fetch(`${API}/chat`, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const d = await r.json();
        if(d.error) throw new Error(d.error);
        currentChatId = d.chatId;
        showType(false);
        addMsgToDOM(parseMarkdown(d.reply), 'mentor');
        
        $('removeImageBtn').click();
        loadChatList();
    } catch(e) {
        showType(false); 
        addMsgToDOM('Ошибка сервера.', 'mentor');
        console.error(e);
    }
}

function addMsgToDOM(text, who) {
    const msgs = $('chatMessages'), ti = $('typingIndicator');
    const div = document.createElement('div'); 
    div.className = 'msg ' + who;
    const ava = who === 'user' ? (currentUser ? currentUser.name[0].toUpperCase() : 'Я') : '🤖';
    div.innerHTML = `<div class="msg-ava">${ava}</div><div class="msg-text">${text}</div>`;
    msgs.insertBefore(div, ti); 
    msgs.scrollTop = msgs.scrollHeight;
}

function showType(on) { 
    const ti = $('typingIndicator'); 
    ti.style.display = on ? 'flex' : 'none'; 
    if(on) $('chatMessages').scrollTop = 99999; 
}

$('sendBtn').addEventListener('click', () => sendAI(null, null));
$('userInput').addEventListener('keypress', e => { 
    if (e.key === 'Enter') sendAI(null, null); 
});

// --- QUESTS ---
const QD = [
    { id:'logic', icon:'🧠', title:'Задача на логику', desc:'A>B, B>C. Верно ли A>C? (Введи "да" или "нет")', reward:50, type:'answer', ans:'да' },
    { id:'html_test', icon:'🌐', title:'Основы Веб', desc:'Как расшифровывается первая буква в HTML? (Введи слово по-английски)', reward:80, type:'answer', ans:'hypertext' },
    { id:'math_brain', icon:'📐', title:'Математика', desc:'Если 5 машин делают 5 деталей за 5 минут, сколько минут нужно 100 машинам, чтобы сделать 100 деталей?', reward:100, type:'answer', ans:'5' },
    { id:'grant', icon:'🏦', title:'Гранты Болашак', desc:'Изучи требования к поступлению на грант по программе.', reward:30, type:'link', link:'https://bolashak.gov.kz' },
    { id:'code_wars', icon:'⚔️', title:'CodeWars', desc:'Перейди на платформу и реши свою первую задачу.', reward:150, type:'link', link:'https://www.codewars.com/' }
];
let activeQ = null;

function renderQuests() {
    const c = $('questsContainer'); 
    if (!c) return; 
    c.innerHTML = '';
    QD.forEach(q => {
        const done = userQuests.includes(q.id);
        const div = document.createElement('div'); 
        div.className = 'quest-item';
        div.innerHTML = `<div class="quest-left"><div class="quest-icon">${q.icon}</div><div class="quest-info"><h4>${q.title}</h4><p>${q.desc}</p></div></div>` + 
            (done ? `<span class="quest-done">✓ Выполнено</span>` : `<div style="text-align:right"><div class="quest-reward">+${q.reward} 🪙</div><button class="btn-primary" style="padding:7px 14px;font-size:.82rem;margin-top:6px" data-qid="${q.id}">Начать</button></div>`);
        c.appendChild(div);
    });
    c.querySelectorAll('[data-qid]').forEach(b => b.addEventListener('click', () => openQModal(b.dataset.qid)));
}

function openQModal(id) {
    const q = QD.find(x => x.id === id); 
    if (!q) return; 
    activeQ = id;
    $('modalTitle').textContent = q.title;
    let body = `<p>${q.desc}</p>`;
    if (q.type === 'answer') body += `<div class="field-group" style="margin-top:14px"><input type="text" id="qAns" placeholder="Ответ..."></div>`;
    if (q.type === 'link') body += `<p style="margin-top:12px"><a href="${q.link}" target="_blank" class="btn-secondary">Открыть сайт</a></p>`;
    $('modalBody').innerHTML = body;
    $('questModal').style.display = 'flex'; 
    setTimeout(() => $('questModal').style.opacity = '1', 10);
}

$('modalClose').addEventListener('click', () => { 
    $('questModal').style.opacity = '0'; 
    setTimeout(() => $('questModal').style.display = 'none', 300); 
});

$('modalComplete').addEventListener('click', async () => {
    const q = QD.find(x => x.id === activeQ); 
    if (!q) return;
    if (q.type === 'answer') {
        const a = ($('qAns') ? $('qAns').value : '').toLowerCase().trim();
        if (a !== q.ans) return alert('Неверно!');
    }
    
    try {
        const r = await fetch(`${API}/api/action`, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ email: currentUser.email, type: 'quest', id: q.id, reward: q.reward }) 
        });
        const d = await r.json();
        if(d.success) { 
            userQuests.push(q.id); 
            addCoinsAnim(q.reward); 
            renderQuests(); 
        } else {
            alert(d.error);
        }
    } catch(e) {
        console.error(e);
    }
    
    $('questModal').style.opacity = '0'; 
    setTimeout(() => $('questModal').style.display = 'none', 300);
});

// --- SHOP ---
const SD = [
    { id:'py', icon:'🎓', name:'Coursera Python', desc:'Основы IT.', price:150, link:'https://coursera.org' },
    { id:'kbtu', icon:'🏛️', name:'План КБТУ', desc:'План поступления от ИИ.', price:80, aiPrompt:'Пошаговый план поступления в КБТУ.' },
    { id:'cv', icon:'📋', name:'Резюме', desc:'ИИ напишет CV.', price:100, aiPrompt:'Напиши профессиональное резюме.' }
];
let activeShopId = null;

function renderShop() {
    const c = $('shopContainer'); 
    if (!c) return; 
    c.innerHTML = '';
    SD.forEach(item => {
        const owned = userShop.includes(item.id);
        const div = document.createElement('div'); 
        div.className = 'shop-item';
        div.innerHTML = `<div class="shop-item-icon">${item.icon}</div><div class="shop-item-name">${item.name}</div><div class="shop-item-desc">${item.desc}</div><div class="shop-item-footer">` + 
            (owned ? `<span class="shop-owned">✓ Куплено</span>` + (item.link ? `<a href="${item.link}" target="_blank" class="btn-outline-sm">Открыть</a>` : `<button class="btn-outline-sm" data-use="${item.id}">Использовать</button>`) : `<span class="shop-price">${item.price} 🪙</span><button class="btn-primary" style="padding:7px 14px;font-size:.82rem" data-buy="${item.id}">Купить</button>`) + `</div>`;
        c.appendChild(div);
    });
    c.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => openShopModal(b.dataset.buy)));
    c.querySelectorAll('[data-use]').forEach(b => b.addEventListener('click', () => useItem(b.dataset.use)));
}

function openShopModal(id) {
    const item = SD.find(x => x.id === id); 
    if (!item) return; 
    activeShopId = id;
    const bal = currentUser.coins, ok = bal >= item.price;
    $('shopModalTitle').textContent = 'Покупка: ' + item.name;
    $('shopModalBody').innerHTML = `<p>${item.desc}</p><p style="margin-top:12px">Цена: <strong>${item.price} 🪙</strong></p><p>Баланс: <strong>${bal} 🪙</strong></p>` + (ok ? '' : `<p style="color:var(--danger)">Мало монет!</p>`);
    $('shopModalConfirm').disabled = !ok;
    $('shopModal').style.display = 'flex'; 
    setTimeout(() => $('shopModal').style.opacity = '1', 10);
}

$('shopModalClose').addEventListener('click', () => { 
    $('shopModal').style.opacity = '0'; 
    setTimeout(() => $('shopModal').style.display = 'none', 300); 
});
$('shopModalCancel').addEventListener('click', () => { 
    $('shopModal').style.opacity = '0'; 
    setTimeout(() => $('shopModal').style.display = 'none', 300); 
});

$('shopModalConfirm').addEventListener('click', async () => {
    const item = SD.find(x => x.id === activeShopId); 
    if (!item) return;
    
    try {
        const r = await fetch(`${API}/api/action`, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ email: currentUser.email, type: 'shop', id: item.id, price: item.price }) 
        });
        const d = await r.json();
        if(d.success) {
            userShop.push(item.id); 
            currentUser.coins -= item.price;
            $('coinCount').textContent = currentUser.coins;
            if($('shopCoinDisplay')) $('shopCoinDisplay').textContent = currentUser.coins;
            renderShop();
        } else {
            alert(d.error);
        }
    } catch(e) {
        console.error(e);
    }

    $('shopModal').style.opacity = '0'; 
    setTimeout(() => $('shopModal').style.display = 'none', 300);
});

function useItem(id) {
    const item = SD.find(x => x.id === id); 
    if (!item || !item.aiPrompt) return;
    document.querySelector('[data-target=mentor]').click();
    startNewChat(); 
    sendAI(item.aiPrompt, `🛍️ Использую: ${item.name}`);
}
