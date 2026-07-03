// === 1. Каунтдаун до "дропа" ===
const cdDays = document.getElementById("cd-days");
if (cdDays) {
  const target = new Date();
  target.setDate(target.getDate() + 45);

  function updateCountdown() {
    const diff = target - new Date();
    if (diff <= 0) {
      document.getElementById("countdownTimer").innerHTML = "<p>Релиз уже вышел 🎉</p>";
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    
    cdDays.textContent = d;
    document.getElementById("cd-hours").textContent = String(h).padStart(2, "0");
    document.getElementById("cd-minutes").textContent = String(m).padStart(2, "0");
    document.getElementById("cd-seconds").textContent = String(s).padStart(2, "0");
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// === 2. Табы дискографии ===
const tabButtons = document.querySelectorAll(".tab-btn");
if (tabButtons.length) {
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".track-list").forEach(list => {
        list.hidden = list.id !== btn.dataset.tab;
      });
    });
  });
}

// === 3. Бургер-меню ===
const burger = document.getElementById("burger");
const navLinksWrap = document.getElementById("navLinks");
if (burger && navLinksWrap) {
  burger.addEventListener("click", function () {
    navLinksWrap.classList.toggle("open");
    const isOpen = navLinksWrap.classList.contains("open");
    burger.textContent = isOpen ? "✕" : "☰";
    burger.setAttribute("aria-expanded", isOpen);
  });
  navLinksWrap.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinksWrap.classList.remove("open");
      burger.textContent = "☰";
    });
  });
}

// === 4. Scroll-reveal ===
document.querySelectorAll("h2, .gallery img, .nav-card, #guestbook-form, .about-card, .track-row, .testimonial-card, .news-card, .countdown-media").forEach(el => {
  el.classList.add("reveal");
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// === 5. Подсветка активного пункта меню ===
(function highlightActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
})();

// === 6. Кнопка со случайными цитатами ===
const phrases = [
  "Шоу начинается! 🎭",
  "Улыбайся, пока мир горит.",
  "Маска — это правда, лицо — это ложь.",
  "Танец продолжается вечно...",
  "Ты готов к представлению?"
];
const quoteButton = document.getElementById("myButton");
const quoteOutput = document.getElementById("output");
if (quoteButton && quoteOutput) {
  quoteButton.addEventListener("click", function () {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    quoteOutput.textContent = phrases[randomIndex];
  });
}

// === 7. Умная Гостевая Книга с реальным Сервером ===
const submitMsg = document.getElementById("submitMsg");
const messagesDiv = document.getElementById("messages");

// Функция отрисовки одного сообщения
function displayMessage(name, text, time) {
  if (!messagesDiv) return;
  const messageItem = document.createElement("div");
  messageItem.className = "message-item";
  messageItem.innerHTML = "<b>" + name + ":</b> " + text + "<span class='time'>" + time + "</span>";
  messagesDiv.prepend(messageItem);
}

// Запрашиваем у сервера ВСЕ сообщения при загрузке страницы join.html
if (messagesDiv) {
  fetch('/api/messages')
    .then(response => response.json())
    .then(savedMsgs => {
      savedMsgs.forEach(msg => {
        displayMessage(msg.name, msg.text, msg.time);
      });
    })
    .catch(err => console.error("Ошибка загрузки сообщений:", err));
}

if (submitMsg) {
  submitMsg.addEventListener("click", function () {
    const nameInput = document.getElementById("nameInput");
    const msgInput = document.getElementById("msgInput");
    if (!nameInput || !msgInput) return;

    const name = nameInput.value.trim();
    const msg = msgInput.value.trim();

    if (name === "" || msg === "") {
      alert("Заполни оба поля!");
      return;
    }

    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Отправляем данные на наш сервер
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, text: msg, time: time })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Если сервер сохранил, отображаем на экране
        displayMessage(name, msg, time);
        nameInput.value = "";
        msgInput.value = "";
      } else {
        alert("Ошибка сервера при сохранении");
      }
    })
    .catch(err => {
      console.error("Ошибка отправки:", err);
      alert("Не удалось связаться с сервером!");
    });
  });
}

// === 8. Кастомный неоновый Интерактивный Плеер ===
const audioBar = document.getElementById("audio-player-bar");
const audioEl = document.getElementById("main-audio-element");
const playBtn = document.getElementById("player-play-btn");
const trackTitle = document.getElementById("player-track-title");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const tracks = document.querySelectorAll(".track-row");
const globalEq = document.getElementById("global-equalizer");

// Отключаем анимацию эквалайзера в шапке по дефолту, пока ничего не играет
if (globalEq) globalEq.style.animationPlayState = 'paused';

if (audioBar && audioEl && playBtn && trackTitle) {
  
  // Клик по треку в списке дискографии
  tracks.forEach(track => {
    track.style.cursor = "pointer";
    track.addEventListener("click", () => {
      const audioSrc = track.getAttribute("data-audio");
      const name = track.querySelector(".track-name").textContent;
      
      // Активируем плеер внизу
      audioBar.classList.add("active");
      trackTitle.textContent = "Сейчас играет: " + name;
      
      audioEl.src = audioSrc;
      audioEl.play();
      playBtn.textContent = "⏸";
      if (globalEq) globalEq.style.animationPlayState = 'running';
    });
  });

  // Кнопка плей/пауза в панели плеера
  playBtn.addEventListener("click", () => {
    if (audioEl.paused) {
      audioEl.play();
      playBtn.textContent = "⏸";
      if (globalEq) globalEq.style.animationPlayState = 'running';
    } else {
      audioEl.pause();
      playBtn.textContent = "▶";
      if (globalEq) globalEq.style.animationPlayState = 'paused';
    }
  });

  // Обновление прогресс-бара
  audioEl.addEventListener("timeupdate", () => {
    const progressPercent = (audioEl.currentTime / audioEl.duration) * 100;
    if (progressBar) progressBar.style.width = progressPercent + "%";
  });

  // Перемотка трека кликом по прогресс-бару
  if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audioEl.duration;
      if (duration) {
        audioEl.currentTime = (clickX / width) * duration;
      }
    });
  }

  // Когда трек закончился
  audioEl.addEventListener("ended", () => {
    playBtn.textContent = "▶";
    if (globalEq) globalEq.style.animationPlayState = 'paused';
    if (progressBar) progressBar.style.width = "0%";
  });
}