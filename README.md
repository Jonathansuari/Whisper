# 👻 ויספר — מדריך הפעלה

## שלב 1: יצירת Firebase (חינמי, 5 דקות)

1. כנס ל- **https://firebase.google.com** והתחבר עם Google
2. לחץ **"Go to console"** → **"Add project"**
3. תן שם לפרויקט (לדוגמה: `whisper-chat`) → המשך
4. **כבה** את Google Analytics → **Create project**

---

## שלב 2: הפעלת Realtime Database

1. בתפריט שמאל: **Build → Realtime Database**
2. לחץ **"Create Database"**
3. בחר מיקום (אפשר ברירת מחדל) → **Next**
4. בחר **"Start in test mode"** → **Enable**

---

## שלב 3: קבלת הגדרות הפרויקט

1. לחץ על **⚙️ (גלגל שיניים)** → **Project settings**
2. גלול למטה עד **"Your apps"**
3. לחץ על **</>** (Web app)
4. תן שם לאפליקציה → **Register app**
5. תראה קוד כזה — **העתק אותו:**

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## שלב 4: עדכון הקוד

פתח את הקובץ **`app.js`** ומצא את השורות:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyPLACEHOLDER_REPLACE_ME",
  ...
};
```

**החלף את כל הבלוק** עם הקוד שהעתקת בשלב 3.

---

## שלב 5: העלאה ל-Vercel (חינמי)

1. כנס ל- **https://vercel.com** → **Sign up with GitHub**
2. לחץ **"Add New Project"**
3. בחר **"Upload"** (גרור את תיקיית `whisper` לאתר)
4. לחץ **Deploy** → תוך 30 שניות יש לינק!

**שתף את הלינק עם כולם — זהו! 🎉**

---

## טיפים

- **Firebase Test Mode** תוקף ל-30 יום. אחרי כן עדכן את ה-rules:
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
- ניתן לראות את ההודעות בזמן אמת ב-Firebase Console תחת Realtime Database
- האפליקציה עובדת כ-PWA — אפשר **"הוסף למסך הבית"** מהטלפון
