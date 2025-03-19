const API_KEY = 'AIzaSyAGKV9Kwt9PW6PL_PpS5kJ9JSPuKUmIrzA';
const SYSTEM_PROMPT = "لحنی خودمانی و صمیمی داشته باش. از جملات کوتاه و ساده استفاده کن. پاسخ‌ها باید دقیق و حرفه‌ای اما با بیانی دوستانه ارائه شوند. همواره سعی کن پاسخ‌ها کمتر از 100 کلمه باشند.";

const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const mobileMenuBtn = document.querySelector('.mobile-menu');
const sidebar = document.querySelector('.sidebar');
const clearChatBtn = document.querySelector('.clear-chat');
const suggestionBtns = document.querySelectorAll('.suggestion');

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    addMessage("سلام! من دستیار هوشمند شما هستم. چطور می‌تونم کمکتون کنم؟", false);
  }, 800);
  
  if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> حالت روز';
  }
});

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes}`;
}

function addMessage(message, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  const time = getCurrentTime();
  messageDiv.innerHTML = `${message}<br><small>${time}</small>`;
  chatArea.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-indicator';
  typingDiv.id = 'typing';
  typingDiv.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatArea.appendChild(typingDiv);
  typingDiv.scrollIntoView({ behavior: 'smooth' });
  return typingDiv;
}

async function generateResponse(prompt) {
  try {
    loading.style.display = 'flex';
    const typingIndicator = showTypingIndicator();
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }]
        }]
      })
    });
    
    if (!response.ok) throw new Error('خطا در ارتباط');
    
    const data = await response.json();
    chatArea.removeChild(typingIndicator);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return 'مشکلی پیش اومد. دوباره امتحان کن!';
  } finally {
    loading.style.display = 'none';
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  
  userInput.disabled = true;
  addMessage(message, true);
  userInput.value = '';
  
  const response = await generateResponse(message);
  addMessage(response, false);
  
  userInput.disabled = false;
  userInput.focus();
}

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  if (document.body.classList.contains('dark-theme')) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> حالت روز';
    localStorage.setItem('darkTheme', 'true');
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> حالت شب';
    localStorage.setItem('darkTheme', 'false');
  }
});

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 && sidebar.classList.contains('open') && 
      !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

clearChatBtn.addEventListener('click', () => {
  chatArea.innerHTML = '';
  setTimeout(() => {
    addMessage("تاریخچه پاک شد. چطور کمکتون کنم؟", false);
  }, 500);
});

suggestionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    userInput.value = btn.textContent;
    userInput.focus();
  });
});

window.addEventListener('load', () => {
  userInput.focus();
});