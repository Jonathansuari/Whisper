// ═══════════════════════════════════════════════
//  WHISPER — אפליקציית צ'אט אנונימי
//  Firebase Realtime Database
// ═══════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded,
  onValue, set, remove, serverTimestamp, query, limitToLast, orderByKey
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ── Firebase config (החלף עם הפרויקט שלך אחרי יצירה ב-Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAWRLsla_1SPMy5QJYqiWM3lAmLCVU5PXQ",
    authDomain: "whispr-90607.firebaseapp.com",
    projectId: "whispr-90607",
    storageBucket: "whispr-90607.firebasestorage.app",
    messagingSenderId: "687229316913",
    appId: "1:687229316913:web:ecfebc7005ba54b6a24a10",
    measurementId: "G-VG7JFHZ71Q"
};

// ── Nickname data
const ADJ = ['אמיץ','שקט','מסתורי','חמוד','חכם','מהיר','עדין','חזק','עצבני','שמח','מוזר','ישיר','כנה','נבוך','חביב','ביישן','פראי','עליז','רציני','שובב'];
const NOUNS = ['פנדה','שועל','זאב','כריש','ינשוף','נמר','דולפין','גמל','ברדלס','ארנב','נחש','דב','נשר','צב','פינגווין','גורילה','קנגורו','זיקית','טווס','לטאה'];
const COLORS = ['#f87171','#fb923c','#fbbf24','#4ade80','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6','#e879f9','#86efac','#67e8f9','#fca5a5','#fdba74'];

// ── State
let app, db;
let myId = '', myName = '', myColor = '';
let isFirebaseReady = false;
let joinTime = Date.now(); 

// ══ INIT
window.addEventListener('DOMContentLoaded', () => {
  generateIdentity();
  setTimeout(hideSplash, 1800);

  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    isFirebaseReady = true;
  } catch(e) {
    console.warn('Firebase init failed, running in demo mode');
    isFirebaseReady = false;
  }
});

function hideSplash() {
  const splash = document.getElementById('splash');
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    document.getElementById('join-screen').classList.remove('hidden');
  }, 500);
}

function generateIdentity() {
  myId = Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
  myName = ADJ[Math.floor(Math.random() * ADJ.length)] + '_' + NOUNS[Math.floor(Math.random() * NOUNS.length)];
  myColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  renderNickname();
}

function renderNickname() {
  document.getElementById('nick-name').textContent = myName;
  document.getElementById('nick-dot').style.background = myColor;
}

window.reroll = function() {
  myName = ADJ[Math.floor(Math.random() * ADJ.length)] + '_' + NOUNS[Math.floor(Math.random() * NOUNS.length)];
  myColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  renderNickname();
  // little bounce
  const box = document.getElementById('nick-box');
  box.style.transform = 'scale(0.95)';
  setTimeout(() => box.style.transform = '', 120);
};

// ══ JOIN
window.joinChat = function() {
  joinTime = Date.now();
  
  document.getElementById('join-screen').classList.add('hidden');
  document.getElementById('chat-screen').classList.remove('hidden');

  // set header badge
  document.getElementById('my-badge-name').textContent = myName;
  document.getElementById('my-badge-dot').style.background = myColor;

  // focus input
  setTimeout(() => document.getElementById('msg-input').focus(), 300);

  if (isFirebaseReady) {
    startFirebase();
  } else {
    startDemo();
  }
};

window.leaveChat = function() {
  if (isFirebaseReady && db) {
    remove(ref(db, `presence/${myId}`)).catch(() => {});
  }
  location.reload();
};

// ══ FIREBASE MODE
function startFirebase() {
  registerPresence();
  listenPresence();
  listenMessages();
}

function registerPresence() {
  const presRef = ref(db, `presence/${myId}`);
  set(presRef, { name: myName, color: myColor, ts: Date.now() });

  // heartbeat every 20s
  setInterval(() => {
    set(presRef, { name: myName, color: myColor, ts: Date.now() });
  }, 20000);

  // remove on unload
  window.addEventListener('beforeunload', () => {
    remove(presRef);
  });
}

function listenPresence() {
  onValue(ref(db, 'presence'), snap => {
    const data = snap.val();
    if (!data) { updateOnline(1); return; }
    const now = Date.now();
    const active = Object.values(data).filter(u => now - u.ts < 45000).length;
    updateOnline(Math.max(active, 1));
  });
}

function listenMessages() {
  const msgsRef = query(ref(db, 'messages'), orderByKey(), limitToLast(80));
  onChildAdded(msgsRef, snap => {
    const msg = snap.val();
    if (!msg) return;

    if (msg.ts && msg.ts >= joinTime) {
      renderMessage(msg);
    }
  });
}

window.sendMsg = async function() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  autoGrow(input);
  document.getElementById('send-btn').disabled = true;

  const msg = {
    id: myId,
    name: myName,
    color: myColor,
    text,
    ts: Date.now()
  };

  if (isFirebaseReady && db) {
    try {
      await push(ref(db, 'messages'), msg);
    } catch(e) {
      renderMessage(msg); // fallback local
    }
  } else {
    renderMessage(msg);
  }

  document.getElementById('send-btn').disabled = false;
  input.focus();
};

// ══ DEMO MODE
function startDemo() {
  updateOnline(3);
  const demoUsers = [
    { id: 'd1', name: 'שקט_נמר', color: '#f87171' },
    { id: 'd2', name: 'מסתורי_ינשוף', color: '#60a5fa' },
    { id: 'd3', name: 'עליז_פנדה', color: '#4ade80' },
  ];
  const msgs = [
    [0, 'מישהו כאן?'],
    [1, 'כן, נמצא 👋'],
    [0, 'סוף סוף מקום שאפשר לדבר בחופשיות'],
    [2, 'אנונימי לגמרי? זה מגניב'],
    [1, 'כן, אף אחד לא יודע מי אתה'],
    [0, 'בדיוק מה שחיפשתי'],
  ];
  let i = 0;
  function next() {
    if (i >= msgs.length) return;
    const [ui, text] = msgs[i++];
    renderMessage({ id: demoUsers[ui].id, name: demoUsers[ui].name, color: demoUsers[ui].color, text, ts: Date.now() });
    setTimeout(next, 1500 + Math.random() * 1500);
  }
  setTimeout(next, 800);
  setInterval(() => updateOnline(Math.floor(Math.random() * 5) + 2), 12000);
}

// ══ RENDER
let lastAuthorId = null;

function renderMessage(msg) {
  const container = document.getElementById('messages');
  const empty = document.getElementById('empty-state');
  if (empty) empty.remove();

  const isMe = msg.id === myId;
  const sameAuthor = msg.id === lastAuthorId;
  lastAuthorId = msg.id;

  const group = document.createElement('div');
  group.className = `msg-group ${isMe ? 'mine' : 'theirs'}`;

  if (!sameAuthor) {
    const sender = document.createElement('div');
    sender.className = 'msg-sender';
    sender.innerHTML = `<span class="sender-dot" style="background:${msg.color}"></span>${isMe ? 'אתה' : msg.name}`;
    group.appendChild(sender);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = msg.text;
  group.appendChild(bubble);

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = formatTime(msg.ts);
  group.appendChild(time);

  container.appendChild(group);
  container.scrollTop = container.scrollHeight;
}

function renderSystem(text) {
  const container = document.getElementById('messages');
  const d = document.createElement('div');
  d.className = 'sys-msg';
  d.textContent = text;
  container.appendChild(d);
  container.scrollTop = container.scrollHeight;
}

function updateOnline(n) {
  document.getElementById('online-count').textContent = `${n} מחוברים`;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

// ══ INPUT HELPERS
window.handleKey = function(e) {
  // on mobile, Enter adds newline — only send on desktop
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 600) {
    e.preventDefault();
    sendMsg();
  }
};

window.autoGrow = function(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  document.getElementById('send-btn').disabled = el.value.trim().length === 0;
};

const wm = document.getElementById("watermark");

let text = "אסור לצלם • שמרו על הפרטיות ";

if (wm) {
  wm.innerHTML = (text + " ").repeat(50);
}
