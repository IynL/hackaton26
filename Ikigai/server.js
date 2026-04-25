import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";

dotenv.config();

// Нам нужен API ключ, если его нет в .env, возьмём из хардкода (для хакатона)
const GROQ_KEY = process.env.GROQ_API_KEY || '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';
const groq = new Groq({ apiKey: GROQ_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

/* =========================
   🗄️ БАЗА ДАННЫХ SQLite
   ========================= */
const db = new sqlite3.Database('./ikigai.db', (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else {
        console.log('Ikig.ai: подключено к SQLite.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password TEXT,
                name TEXT,
                coins INTEGER DEFAULT 0,
                streak INTEGER DEFAULT 1,
                last_login DATE DEFAULT CURRENT_DATE,
                avatar TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS quests_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                quest_id TEXT,
                date DATE DEFAULT CURRENT_DATE,
                UNIQUE(email, quest_id, date)
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS shop_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                item_id TEXT,
                UNIQUE(email, item_id)
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS chat_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                title TEXT,
                is_interview BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER,
                role TEXT,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(chat_id) REFERENCES chat_sessions(id)
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS finance_income (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                source TEXT,
                amount INTEGER,
                note TEXT,
                month INTEGER,
                year INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS finance_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                category TEXT,
                amount INTEGER,
                description TEXT,
                date DATE DEFAULT CURRENT_DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }
});

/* =========================
   🔐 АВТОРИЗАЦИЯ И ДАННЫЕ
   ========================= */
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], function(err) {
        if (err) return res.status(400).json({ error: "Email уже существует" });
        res.json({ message: "Успех", email, name, coins: 0, streak: 1, avatar: null });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Неверный логин" });
        
        // Логика стриков (Streak)
        const today = new Date().toISOString().split('T')[0];
        let newStreak = user.streak;
        if (user.last_login !== today) {
            const last = new Date(user.last_login);
            const current = new Date(today);
            const diffTime = Math.abs(current - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) newStreak += 1;
            else newStreak = 1;
            db.run("UPDATE users SET streak = ?, last_login = ? WHERE email = ?", [newStreak, today, email]);
        }
        res.json({ email: user.email, name: user.name, coins: user.coins, streak: newStreak, avatar: user.avatar });
    });
});

app.get("/api/user/:email", (req, res) => {
    const { email } = req.params;
    db.get("SELECT name, coins, streak, avatar FROM users WHERE email = ?", [email], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Not found" });
        
        db.all("SELECT quest_id FROM quests_log WHERE email = ? AND date = CURRENT_DATE", [email], (err, quests) => {
            db.all("SELECT item_id FROM shop_log WHERE email = ?", [email], (err, shop) => {
                res.json({
                    name: row.name,
                    coins: row.coins,
                    streak: row.streak,
                    avatar: row.avatar,
                    quests: quests ? quests.map(q => q.quest_id) : [],
                    shop: shop ? shop.map(s => s.item_id) : []
                });
            });
        });
    });
});

app.post("/api/user/avatar", (req, res) => {
    const { email, avatar } = req.body;
    db.run("UPDATE users SET avatar = ? WHERE email = ?", [avatar, email], function(err) {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        res.json({ success: true });
    });
});

// Квесты и магазин
app.post("/api/action", (req, res) => {
    const { email, type, id, reward, price } = req.body; // type: 'quest' or 'shop'
    if (type === 'quest') {
        db.run("INSERT INTO quests_log (email, quest_id) VALUES (?, ?)", [email, id], function(err) {
            if (err) return res.status(400).json({ error: "Уже выполнено" });
            db.run("UPDATE users SET coins = coins + ? WHERE email = ?", [reward, email], () => {
                res.json({ success: true, reward });
            });
        });
    } else if (type === 'shop') {
        db.get("SELECT coins FROM users WHERE email = ?", [email], (err, user) => {
            if (user.coins < price) return res.status(400).json({ error: "Мало монет" });
            db.run("UPDATE users SET coins = coins - ? WHERE email = ?", [price, email], () => {
                db.run("INSERT INTO shop_log (email, item_id) VALUES (?, ?)", [email, id]);
                res.json({ success: true });
            });
        });
    }
});

/* =========================
   💬 МУЛЬТИМОДАЛЬНЫЙ ЧАТ
   ========================= */
const SYS_MENTOR = "Ты — Хоши-AI, умный AI-ментор платформы Ikig.ai (образовательная платформа в Казахстане). Помогай выбрать IT-профессию, найти гранты и университеты (KBTU, MUIT, NU, AITU, SDU и др.). Тон мотивирующий, дружелюбный. Все цены и зарплаты указывай в ТЕНГЕ (₸). Всегда отвечай с фокусом на рынок труда Казахстана. Используй **жирный** текст для выделения ключевых слов. Если видишь фото (например, резюме или сертификат) — проанализируй его детально.";
const SYS_INTERVIEW = "Ты строгий HR-менеджер топовой IT компании в Казахстане (Kolesa Group, Kaspi, Choco, Epam KZ). Твоя задача — провести собеседование. Задавай по ОДНОМУ профессиональному вопросу за раз. Задавай вопросы, релевантные для рынка Казахстана. После 3-го вопроса дай развернутый фидбек и оцени кандидата от 1 до 10. Используй **жирный** для ключевых оценок. Будь краток.";

app.post("/chat", async (req, res) => {
    const { email, message, image, isInterview } = req.body;
    let { chatId } = req.body;

    if (!email) return res.status(401).json({ error: "Необходима авторизация" });

    try {
        if (!chatId) {
            const title = isInterview ? "HR Собеседование" : (message ? message.substring(0, 30) + "..." : "Новый чат с фото");
            chatId = await new Promise((resolve, reject) => {
                db.run("INSERT INTO chat_sessions (email, title, is_interview) VALUES (?, ?, ?)", [email, title, isInterview?1:0], function(err) {
                    if (err) reject(err); else resolve(this.lastID);
                });
            });
        } else {
            // Проверка владельца чата
            const ownerEmail = await new Promise((resolve, reject) => {
                db.get("SELECT email FROM chat_sessions WHERE id = ?", [chatId], (err, row) => {
                    if (err) reject(err); else resolve(row?.email);
                });
            });
            if (ownerEmail !== email) {
                return res.status(403).json({ error: "Access denied to this chat" });
            }
        }

        let userContent;
        let modelName;
        const hasImage = !!image;

        // Если есть картинка — используем Llama Vision Model
        if (hasImage) {
            modelName = "llama-3.2-11b-vision-preview";
            userContent = [];
            if (message) userContent.push({ type: "text", text: message });
            else userContent.push({ type: "text", text: "Проанализируй этот документ/изображение." });
            userContent.push({ type: "image_url", image_url: { url: image } });
        } else {
            modelName = "llama-3.3-70b-versatile";
            userContent = message;
        }

        // Сохраняем в БД (картинку сохранять в базу дорого, поэтому сохраняем только текст, если это не принципиально. Но для истории сохраним)
        await new Promise((res, rej) => db.run("INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)", [chatId, "user", JSON.stringify(userContent)], err => err?rej(err):res()));

        // Достаем историю
        const historyRows = await new Promise((resolve, reject) => {
            db.all("SELECT role, content FROM chat_messages WHERE chat_id = ? ORDER BY id ASC", [chatId], (err, rows) => {
                if (err) reject(err); else resolve(rows);
            });
        });

        const conversation = historyRows.map(row => {
            let parsedContent;
            try { parsedContent = JSON.parse(row.content); } catch (e) { parsedContent = row.content; }
            
            // Если сейчас текстовый запрос, убираем картинки из истории, чтобы модель не упала
            if (!hasImage && Array.isArray(parsedContent)) {
                const textParts = parsedContent.filter(part => part.type === "text").map(part => part.text);
                parsedContent = textParts.join("\n") || "[Изображение отправлено ранее]";
            }
            return { role: row.role, content: parsedContent };
        });

        const systemMessage = { role: "system", content: isInterview ? SYS_INTERVIEW : SYS_MENTOR };

        const completion = await groq.chat.completions.create({
            model: modelName,
            messages: [systemMessage, ...conversation],
            temperature: 0.7,
            max_tokens: 2048,
        });

        const reply = completion?.choices?.[0]?.message?.content || "Ошибка генерации";

        await new Promise((res, rej) => db.run("INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)", [chatId, "assistant", JSON.stringify(reply)], err => err?rej(err):res()));

        res.json({ reply, chatId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка AI сервера" });
    }
});

app.get("/api/chats/:email", (req, res) => {
    db.all("SELECT id, title, is_interview FROM chat_sessions WHERE email = ? ORDER BY id DESC", [req.params.email], (err, rows) => {
        res.json(rows || []);
    });
});
app.get("/api/chats/messages/:id", (req, res) => {
    db.all("SELECT role, content FROM chat_messages WHERE chat_id = ? ORDER BY id ASC", [req.params.id], (err, rows) => {
        const msgs = (rows||[]).map(r => {
            let p; try { p = JSON.parse(r.content); } catch(e) { p = r.content; }
            return { role: r.role, content: p };
        });
        res.json(msgs);
    });
});

/* =========================
   💰 ФИНАНСОВЫЙ КОШЕЛЁК
   ========================= */

// Получить сводку за месяц
app.get('/api/finance/:email', (req, res) => {
    const { email } = req.params;
    const now = new Date();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const year = parseInt(req.query.year) || now.getFullYear();

    // Прошлый месяц
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    db.all('SELECT * FROM finance_income WHERE email=? AND month=? AND year=? ORDER BY id DESC', [email, month, year], (err, incomes) => {
        db.all('SELECT * FROM finance_expenses WHERE email=? AND strftime(\'%m\', date)=? AND strftime(\'%Y\', date)=? ORDER BY id DESC',
            [email, String(month).padStart(2,'0'), String(year)], (err2, expenses) => {
            db.all('SELECT SUM(amount) as total FROM finance_income WHERE email=? AND month=? AND year=?', [email, prevMonth, prevYear], (e3, prevInc) => {
                db.all('SELECT SUM(amount) as total FROM finance_expenses WHERE email=? AND strftime(\'%m\', date)=? AND strftime(\'%Y\', date)=?',
                    [email, String(prevMonth).padStart(2,'0'), String(prevYear)], (e4, prevExp) => {
                    res.json({
                        incomes: incomes || [],
                        expenses: expenses || [],
                        prevIncome: (prevInc[0]?.total) || 0,
                        prevExpenses: (prevExp[0]?.total) || 0,
                        month, year
                    });
                });
            });
        });
    });
});

// Добавить доход
app.post('/api/finance/income', (req, res) => {
    const { email, source, amount, note, month, year } = req.body;
    db.run('INSERT INTO finance_income (email, source, amount, note, month, year) VALUES (?,?,?,?,?,?)',
        [email, source, amount, note || '', month, year], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Удалить доход
app.delete('/api/finance/income/:id', (req, res) => {
    db.run('DELETE FROM finance_income WHERE id=?', [req.params.id], err => {
        res.json({ success: !err });
    });
});

// Добавить расход
app.post('/api/finance/expense', (req, res) => {
    const { email, category, amount, description, date } = req.body;
    db.run('INSERT INTO finance_expenses (email, category, amount, description, date) VALUES (?,?,?,?,?)',
        [email, category, amount, description || '', date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Удалить расход
app.delete('/api/finance/expense/:id', (req, res) => {
    db.run('DELETE FROM finance_expenses WHERE id=?', [req.params.id], err => {
        res.json({ success: !err });
    });
});

/* =========================
   📊 Интеграция API HH.kz
   ========================= */
app.get("/api/vacancies", async (req, res) => {
    try {
        const query = req.query.q || "Junior Developer";
        // API HH требует User-Agent
        const r = await fetch(`https://api.hh.ru/vacancies?text=${encodeURIComponent(query)}&area=40&per_page=1`, {
            headers: { 'User-Agent': 'Ikigai/1.0 (test@test.com)' }
        });
        const data = await r.json();
        res.json({ count: data.found || 0 });
    } catch(e) {
        res.json({ count: "н/д" });
    }
});

/* =========================
   🚀 СТАРТ
   ========================= */
app.listen(3000, () => {
    console.log(`Ikig.ai Backend (Хоши-AI) запущен на http://localhost:3000`);
});
