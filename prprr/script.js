// === GROQ API CONFIG ===
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// === AUTH & SESSION LOGIC ===
const authScreen = document.getElementById('authScreen');
const appContainer = document.getElementById('appContainer');
const authTabs = document.querySelectorAll('.auth-tab');
const authForm = document.getElementById('authForm');
const nameGroup = document.getElementById('nameGroup');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authBtnText = document.getElementById('authBtnText');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');

const headerUserName = document.getElementById('headerUserName');
const headerAvatar = document.getElementById('headerAvatar');

let currentAuthMode = 'login'; // login or register
let currentUser = null;

// Инициализация при загрузке
function initAuth() {
    const savedSession = localStorage.getItem('edunav_session');
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
        loginUser(currentUser);
    }
}

// Переключение вкладок входа/регистрации
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentAuthMode = tab.getAttribute('data-auth');
        authError.style.display = 'none';
        
        if (currentAuthMode === 'register') {
            nameGroup.style.display = 'block';
            authName.required = true;
            authBtnText.textContent = 'Создать защищенный аккаунт';
        } else {
            nameGroup.style.display = 'none';
            authName.required = false;
            authBtnText.textContent = 'Войти';
        }
    });
});

// Обработка формы авторизации
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value;
    const name = authName.value.trim();
    
    // Простая симуляция безопасного хранения (base64)
    const encodedPassword = btoa(password);
    
    if (currentAuthMode === 'register') {
        const users = JSON.parse(localStorage.getItem('edunav_users') || '{}');
        if (users[email]) {
            showError("Этот email уже зарегистрирован.");
            return;
        }
        
        const newUser = { name, email, pwd: encodedPassword };
        users[email] = newUser;
        localStorage.setItem('edunav_users', JSON.stringify(users));
        
        // Автоматический вход
        localStorage.setItem('edunav_session', JSON.stringify(newUser));
        loginUser(newUser);
        
    } else {
        const users = JSON.parse(localStorage.getItem('edunav_users') || '{}');
        const user = users[email];
        
        if (!user || user.pwd !== encodedPassword) {
            showError("Неверный email или пароль.");
            return;
        }
        
        localStorage.setItem('edunav_session', JSON.stringify(user));
        loginUser(user);
    }
});

function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
}

function loginUser(user) {
    currentUser = user;
    authScreen.style.display = 'none';
    appContainer.style.display = 'block';
    headerUserName.textContent = user.name;
    headerAvatar.textContent = user.name.charAt(0).toUpperCase();
    updateCoinDisplay(getCoins(), 0); // Обновить баланс монет
    initAIContext();
    initQuestButtons(); // Инициализировать кнопки квестов
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('edunav_session');
    currentUser = null;
    appContainer.style.display = 'none';
    authScreen.style.display = 'flex';
    authEmail.value = '';
    authPassword.value = '';
});

// === GLOBAL STATE FOR AI ===
let conversationHistory = [];

function initAIContext() {
    const userName = currentUser ? currentUser.name : 'пользователь';
    conversationHistory = [
        {
            role: "system",
            content: `Ты — продвинутый AI-ментор по имени «Агашка» (или просто Ментор), эксперт по IT, социальному предпринимательству и образованию в Казахстане. Твоя задача — помогать школьникам находить свой путь, мотивировать их, подсказывать, как получить гранты (например, Bolashak, гранты КБТУ, AITU, KAZENERGY) и как упаковать портфолио. Общайся в вдохновляющем, современном, слегка неформальном стиле (салем, красавчик, круто), но профессионально. Давай конкретные названия ВУЗов и стипендий. ИМЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ: ${userName}. Обязательно обращайся к нему по имени, чтобы создать персонализированный опыт!`
        }
    ];
}


// === TAB NAVIGATION LOGIC ===
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем active у всех
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));
        
        // Ставим active текущей
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// === SMART SEARCH LOGIC (DASHBOARD) ===
const analyzeBtn = document.getElementById('analyzeBtn');
const userInterests = document.getElementById('userInterests');
const userAchievements = document.getElementById('userAchievements');

analyzeBtn.addEventListener('click', () => {
    const interests = userInterests.value.trim() || 'не указано';
    const achievements = userAchievements.value.trim() || 'не указано';
    
    if (interests === 'не указано' && achievements === 'не указано') {
        alert("Пожалуйста, заполни хотя бы одно поле (интересы или достижения)!");
        return;
    }
    
    // Переключаемся на вкладку ментора
    document.querySelector('[data-target="mentor"]').click();
    
    const displayMsg = `Проанализируй мой профиль!\nИнтересы: ${interests}\nДостижения: ${achievements}`;
    const hiddenPrompt = `Проанализируй мой профиль. Интересы: ${interests}. Достижения: ${achievements}. Подбери 3 наиболее подходящие мне IT-профессии. Для каждой дай: 1) обоснование, 2) топовый ВУЗ в Казахстане, 3) грант/стипендию. Отвечай структурно и мотивирующе!`;
    
    addMessageToUI(displayMsg, 'user');
    conversationHistory.push({ role: "user", content: hiddenPrompt });
    
    userInterests.value = '';
    userAchievements.value = '';
    
    fetchAIResponse();
});

const generateCVBtn = document.getElementById('generateCVBtn');
if(generateCVBtn) {
    generateCVBtn.addEventListener('click', () => {
        const interests = userInterests.value.trim() || 'не указано';
        const achievements = userAchievements.value.trim() || 'не указано';
        
        if (interests === 'не указано' && achievements === 'не указано') {
            alert("Пожалуйста, заполни поля (интересы и достижения), чтобы я мог собрать резюме!");
            return;
        }
        
        // Переключаемся на вкладку ментора
        document.querySelector('[data-target="mentor"]').click();
        
        const displayMsg = `Упакуй мои достижения в резюме/мотивационное письмо!\nМои данные: ${achievements}`;
        const hiddenPrompt = `Я хочу подать заявку на стажировку или грант. Мои достижения: ${achievements}. Мои интересы: ${interests}. Напиши для меня мощное, продающее 'Summary' (Обо мне) для резюме или драфт мотивационного письма (на 2-3 абзаца). Сделай так, чтобы мои (даже небольшие) достижения выглядели профессионально и впечатляюще.`;
        
        addMessageToUI(displayMsg, 'user');
        conversationHistory.push({ role: "user", content: hiddenPrompt });
        
        fetchAIResponse();
    });
}


// === COINS ECONOMY ===
function getCoins() {
    const user = JSON.parse(localStorage.getItem('edunav_session') || '{}');
    return parseInt(localStorage.getItem(`edunav_coins_${user.email}`) || '0');
}
function addCoins(amount) {
    const user = JSON.parse(localStorage.getItem('edunav_session') || '{}');
    const key = `edunav_coins_${user.email}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    const newAmount = current + amount;
    localStorage.setItem(key, newAmount);
    updateCoinDisplay(newAmount, amount);
    return newAmount;
}
function spendCoins(amount) {
    const user = JSON.parse(localStorage.getItem('edunav_session') || '{}');
    const key = `edunav_coins_${user.email}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    if (current < amount) return false;
    localStorage.setItem(key, current - amount);
    updateCoinDisplay(current - amount, -amount);
    return true;
}
function updateCoinDisplay(total, delta) {
    const el = document.getElementById('coinBalance');
    if (!el) return;
    el.textContent = `🪙 ${total}`;
    el.style.animation = 'none';
    setTimeout(() => { el.style.animation = 'coinPop 0.4s ease'; }, 10);
    if (delta > 0) {
        const pop = document.createElement('span');
        pop.className = 'coin-pop';
        pop.textContent = `+${delta}`;
        el.parentElement.appendChild(pop);
        setTimeout(() => pop.remove(), 1000);
    }
}
function isQuestDone(questId) {
    const today = new Date().toDateString();
    return localStorage.getItem(`quest_${questId}_${today}`) === 'done';
}
function markQuestDone(questId) {
    const today = new Date().toDateString();
    localStorage.setItem(`quest_${questId}_${today}`, 'done');
}

// === INTERACTIVE PROFTEST LOGIC ===
const testQuestions = [
    {
        question: "Чем ты чаще всего занимаешься в свободное время?",
        options: [
            { text: "Играю в игры и думаю, как они устроены", icon: "🎮", tag: "gamedev" },
            { text: "Снимаю видео, веду блог или соцсети", icon: "📱", tag: "marketing" },
            { text: "Рисую, делаю коллажи или придумываю интерфейсы", icon: "🎨", tag: "design" },
            { text: "Пишу код или решаю математические задачи", icon: "💻", tag: "backend" }
        ]
    },
    {
        question: "Какой предмет в школе нравился больше всего?",
        options: [
            { text: "Математика и информатика", icon: "➗", tag: "backend" },
            { text: "Физика и химия", icon: "⚗️", tag: "ai" },
            { text: "История, обществознание, право", icon: "📚", tag: "pm" },
            { text: "Английский и риторика", icon: "🗣️", tag: "marketing" }
        ]
    },
    {
        question: "Если тебе дают задачу, ты:",
        options: [
            { text: "Разбираю всё на шаги и иду строго по плану", icon: "📋", tag: "backend" },
            { text: "Гуглю похожие случаи и собираю лучшее решение", icon: "🔍", tag: "ai" },
            { text: "Придумываю нестандартный, креативный подход", icon: "✨", tag: "design" },
            { text: "Созываю команду и делегирую задачи", icon: "🤝", tag: "pm" }
        ]
    },
    {
        question: "Что тебя пугает больше всего?",
        options: [
            { text: "Публичные выступления перед людьми", icon: "😰", tag: "backend" },
            { text: "Рутинная однообразная работа", icon: "😴", tag: "design" },
            { text: "Работать без чёткого ТЗ и правил", icon: "😵", tag: "pm" },
            { text: "Никогда не создать что-то своё", icon: "😟", tag: "gamedev" }
        ]
    },
    {
        question: "Ты смотришь новости про технологии. Что тебя цепляет больше?",
        options: [
            { text: "ChatGPT, нейросети и будущее AI", icon: "🤖", tag: "ai" },
            { text: "Новые устройства и крутой продуктовый дизайн", icon: "📲", tag: "design" },
            { text: "Как стартапы получили инвестиции и выросли", icon: "📈", tag: "pm" },
            { text: "Хакеры, уязвимости и защита данных", icon: "🔐", tag: "security" }
        ]
    },
    {
        question: "Если ты создаёшь сайт, то ты хочешь:",
        options: [
            { text: "Сделать его максимально красивым и удобным", icon: "🖌️", tag: "design" },
            { text: "Написать надёжный бэкенд и API", icon: "🔧", tag: "backend" },
            { text: "Настроить серверы, базы данных и автодеплой", icon: "☁️", tag: "devops" },
            { text: "Придумать, какую проблему он решает", icon: "💡", tag: "pm" }
        ]
    },
    {
        question: "Представь, что ты основал стартап. Ты:",
        options: [
            { text: "CEO — задаю вектор, договариваюсь с инвесторами", icon: "👔", tag: "pm" },
            { text: "CTO — строю архитектуру всей системы", icon: "🏗️", tag: "backend" },
            { text: "Chief AI Officer — внедряю нейросети везде", icon: "🧠", tag: "ai" },
            { text: "CMO — делаю продукт вирусным и узнаваемым", icon: "📣", tag: "marketing" }
        ]
    },
    {
        question: "Тебе нравится работать:",
        options: [
            { text: "Один, в тишине и с наушниками", icon: "🎧", tag: "backend" },
            { text: "С маленькой, сплочённой командой", icon: "👥", tag: "design" },
            { text: "Публично, выступать и презентовать", icon: "🎤", tag: "marketing" },
            { text: "Удалённо, в разных часовых поясах", icon: "🌍", tag: "devops" }
        ]
    },
    {
        question: "Твоя суперсила в будущем:",
        options: [
            { text: "Я буду строить системы, которые не ломаются", icon: "🛡️", tag: "security" },
            { text: "Я буду создавать AI, которые думают за нас", icon: "🤖", tag: "ai" },
            { text: "Я буду создавать игры, в которые будет играть весь мир", icon: "🕹️", tag: "gamedev" },
            { text: "Я буду автоматизировать всё, что можно автоматизировать", icon: "⚙️", tag: "devops" }
        ]
    }
];

let currentQuestionIndex = 0;
let userAnswers = [];

const startTestBtn = document.getElementById('startTestBtn');
const testStartScreen = document.getElementById('testStartScreen');
const testQuizScreen = document.getElementById('testQuizScreen');
const testResultScreen = document.getElementById('testResultScreen');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const questionCounter = document.getElementById('questionCounter');
const progressFill = document.getElementById('progressFill');

startTestBtn.addEventListener('click', () => {
    testStartScreen.classList.remove('active');
    testQuizScreen.classList.add('active');
    currentQuestionIndex = 0;
    userAnswers = [];
    renderQuestion();
});

function renderQuestion() {
    const q = testQuestions[currentQuestionIndex];
    questionText.textContent = q.question;
    questionCounter.textContent = `Вопрос ${currentQuestionIndex + 1} из ${testQuestions.length}`;
    
    // Анимация прогресс-бара
    const progress = ((currentQuestionIndex) / testQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const card = document.createElement('div');
        card.classList.add('option-card');
        card.innerHTML = `
            <div class="option-icon">${opt.icon}</div>
            <div class="option-text">${opt.text}</div>
        `;
        
        card.addEventListener('click', () => handleOptionClick(opt.tag));
        optionsContainer.appendChild(card);
    });
}

function handleOptionClick(tag) {
    userAnswers.push(tag);
    currentQuestionIndex++;
    
    if (currentQuestionIndex < testQuestions.length) {
        // Добавляем плавный переход
        testQuizScreen.style.opacity = 0;
        setTimeout(() => {
            renderQuestion();
            testQuizScreen.style.opacity = 1;
        }, 300);
    } else {
        finishTest();
    }
}

function finishTest() {
    progressFill.style.width = `100%`;
    setTimeout(() => {
        testQuizScreen.classList.remove('active');
        testResultScreen.classList.add('active');
        
        // Подсчитываем доминирующий тег
        const tagCounts = {};
        userAnswers.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
        const dominantTag = Object.entries(tagCounts).sort((a,b) => b[1]-a[1])[0][0];
        
        const tagNames = {
            'design': 'UX/UI Дизайн и Продукт',
            'backend': 'Backend и Серверная разработка',
            'pm': 'Product Management и Предпринимательство',
            'gamedev': 'GameDev и Разработка игр',
            'marketing': 'Digital Marketing и Growth Hacking',
            'ai': 'Artificial Intelligence и Data Science',
            'security': 'Кибербезопасность и Cybersecurity',
            'devops': 'DevOps и Cloud Engineering'
        };
        const interestStr = tagNames[dominantTag] || 'Full-Stack разработка';
        
        const userName = currentUser ? currentUser.name : '';
        const testPrompt = `Я (${userName}) только что прошел детальный IT-профтест из 9 вопросов. Результат: моя доминирующая склонность — ${interestStr}. Расскажи мне: 1) Какая профессия мне идеально подходит и почему; 2) Топ-2 вуза в Казахстане с прямыми ссылками на абитуриентские страницы; 3) Стипендию/грант для этого направления; 4) 3 навыка, которые надо прокачать уже сейчас.`;
        
        conversationHistory.push({ role: "user", content: testPrompt });
        
        // Начисляем 100 монет за прохождение теста
        addCoins(100);
        
        setTimeout(() => {
            document.querySelector('[data-target="mentor"]').click();
            addMessageToUI(`🏁 Тест завершен! Доминанта: ${interestStr}. Начислено +100 🪙. Жду персональный разбор от ментора...`, 'user');
            testResultScreen.classList.remove('active');
            testStartScreen.classList.add('active');
            fetchAIResponse();
        }, 2000);
        
    }, 500);
}


// === AI MENTOR CHAT LOGIC ===
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const clearChatBtn = document.getElementById('clearChatBtn');

function addMessageToUI(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    // Аватарка: первая буква имени, если это юзер
    let avatarChar = 'И';
    if (sender === 'user' && currentUser) {
        avatarChar = currentUser.name.charAt(0).toUpperCase();
    }
    let avatar = sender === 'user' ? avatarChar : '🤖';
    
    // Поддержка переносов строк
    const formattedText = text.replace(/\n/g, '<br>');
    
    msgDiv.innerHTML = `
        <div class="msg-avatar">${avatar}</div>
        <div class="msg-bubble">${formattedText}</div>
    `;
    
    chatMessages.insertBefore(msgDiv, typingIndicator);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

function fetchAIResponse() {
    showTyping();
    
    fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 1024
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const aiResponse = data.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: aiResponse });
        hideTyping();
        addMessageToUI(aiResponse, 'mentor');
    })
    .catch(error => {
        console.error("Ошибка Groq API:", error);
        hideTyping();
        addMessageToUI("Извини, сервер перегружен. Попробуй через пару секунд.", 'mentor');
    });
}

function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessageToUI(text, 'user');
    conversationHistory.push({ role: "user", content: text });
    userInput.value = '';

    fetchAIResponse();
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

clearChatBtn.addEventListener('click', () => {
    // Оставляем только первый системный промпт
    conversationHistory = [conversationHistory[0]];
    
    // Очищаем UI, оставляя только typing indicator
    Array.from(chatMessages.children).forEach(child => {
        if (child.id !== 'typingIndicator') {
            child.remove();
        }
    });
    
    addMessageToUI("История очищена. Давай начнем заново! Что тебя интересует?", 'mentor');
});

// Запускаем инициализацию при старте
initAuth();

// === QUEST BUTTONS LOGIC ===
function initQuestButtons() {
    const questBtns = document.querySelectorAll('[data-quest-id]');
    questBtns.forEach(btn => {
        const questId = btn.getAttribute('data-quest-id');
        const reward = parseInt(btn.getAttribute('data-reward'));
        if (isQuestDone(questId)) {
            btn.textContent = '✔️ Выполнено';
            btn.disabled = true;
            btn.style.opacity = '0.5';
        } else {
            btn.addEventListener('click', () => {
                markQuestDone(questId);
                addCoins(reward);
                btn.textContent = '✔️ Выполнено';
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });
        }
    });
}
