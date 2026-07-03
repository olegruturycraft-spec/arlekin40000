const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'messages.json');

// Чтобы сервер понимал JSON-запросы
app.use(express.json());

// ЛОГЕР: Будет писать в консоль абсолютно все запросы, которые приходят!
app.use((req, res, next) => {
  console.log(`[ЗАПРОС] ${req.method} на адрес: ${req.url}`);
  next();
});

// Отдаем файлы сайта из текущей папки
app.use(express.static(__dirname));

// Функция для чтения сообщений
function readMessages() {
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data) || [];
  } catch (e) {
    console.error("Ошибка чтения JSON:", e);
    return [];
  }
}

// 1. Маршрут получения сообщений
app.get('/api/messages', (req, res) => {
  res.json(readMessages());
});

// 2. Маршрут отправки сообщения
app.post('/api/messages', (req, res) => {
  console.log('[БЭКЕНД] Получены данные для сохранения:', req.body);
  const { name, text, time } = req.body;
  
  if (!name || !text) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const messages = readMessages();
  messages.push({ name, text, time });

  fs.writeFileSync(FILE_PATH, JSON.stringify(messages, null, 2), 'utf8');
  console.log('[БЭКЕНД] Сообщение успешно записано в messages.json!');
  res.status(201).json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`😈 Паутина Арлекина успешно запущена!`);
  console.log(`Сайт доступен тут -> http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});