<div align="center">

```
██████╗ ███████╗ █████╗ ██╗      ████████╗██╗███╗   ███╗███████╗    ██╗██████╗ ███████╗
██╔══██╗██╔════╝██╔══██╗██║      ╚══██╔══╝██║████╗ ████║██╔════╝    ██║██╔══██╗██╔════╝
██████╔╝█████╗  ███████║██║         ██║   ██║██╔████╔██║█████╗      ██║██║  ██║█████╗  
██╔══██╗██╔══╝  ██╔══██║██║         ██║   ██║██║╚██╔╝██║██╔══╝      ██║██║  ██║██╔══╝  
██║  ██║███████╗██║  ██║███████╗    ██║   ██║██║ ╚═╝ ██║███████╗    ██║██████╔╝███████╗
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝    ╚═╝╚═════╝ ╚══════╝
```

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=22&duration=3000&pause=1000&color=818CF8&center=true&vCenter=true&multiline=true&width=600&height=80&lines=Code%2C+Chat+%26+Collaborate.;It%27s+all+in+sync+%E2%9A%A1" alt="Typing SVG" />

<br/>

[![GitHub stars](https://img.shields.io/github/stars/JAYESH-SOLMINDE/Real-Time-IDE?style=for-the-badge&color=818cf8&labelColor=0d0d1a)](https://github.com/JAYESH-SOLMINDE/Real-Time-IDE/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/JAYESH-SOLMINDE/Real-Time-IDE?style=for-the-badge&color=60a5fa&labelColor=0d0d1a)](https://github.com/JAYESH-SOLMINDE/Real-Time-IDE/forks)
[![GitHub issues](https://img.shields.io/github/issues/JAYESH-SOLMINDE/Real-Time-IDE?style=for-the-badge&color=f472b6&labelColor=0d0d1a)](https://github.com/JAYESH-SOLMINDE/Real-Time-IDE/issues)
[![License](https://img.shields.io/badge/license-MIT-c084fc?style=for-the-badge&labelColor=0d0d1a)](LICENSE)

<br/>

> *"In a world where code flows like chakra — every keystroke echoes across the realm in real time."* ⚔️

</div>

---

<div align="center">

## ⚡ 「 ABOUT THE PROJECT 」 ⚡

</div>

**Real Time IDE** is a browser-based collaborative code editor where multiple developers can write, run, and discuss code *simultaneously* — like a multiplayer anime battle, but for building software.

No installation. No login. Just drop in a room ID and start coding with your team.

```
┌─────────────────────────────────────────────────────────────┐
│  👾  Two developers. One room. Zero lag.                    │
│  🤖  AI suggests your next move like a sensei.             │
│  🎨  Draw your ideas on the infinite whiteboard.           │
│  ▶️  Execute code in 8+ languages instantly.              │
└─────────────────────────────────────────────────────────────┘
```

---

<div align="center">

## 🌸 「 FEATURE SCROLLS 」 🌸

</div>

<table>
<tr>
<td width="50%">

### ⚔️ Real-Time Collaboration
Every keystroke synced instantly across all collaborators. Watch live cursors move like ninja — no lag, no conflicts, no mercy.

### 🤖 AI Code Sensei
Powered by **Groq + Llama 3.3 70B**. Type your code, pause for a breath — and your AI sensei whispers what comes next.

### 🎨 Infinite Whiteboard
A full drawing canvas with pen, brush, fountain pen, shapes, arrows, text, undo/redo — explain your architecture like an anime battle plan.

</td>
<td width="50%">

### 💬 Live Chat Jutsu
Talk to your teammates without leaving the editor. Every message lands instantly like a shuriken.

### ▶️ Code Execution Engine
Run **JavaScript, Python, TypeScript, Java, C++, C, Go** directly in the browser. See output in milliseconds.

### 📁 File Explorer
Create, rename, delete files on the fly. Tab switching, syntax detection — built for speed.

</td>
</tr>
</table>

---

<div align="center">

## 🗡️ 「 TECH STACK 」 🗡️

</div>

<div align="center">

| Layer | Technology |
|:------|:-----------|
| ⚛️ **Frontend** | React 18 + TypeScript + Vite |
| 🎨 **Styling** | Tailwind CSS + Framer Motion |
| 📝 **Editor** | Monaco Editor (VS Code's engine) |
| 🔌 **Real-time** | Socket.io WebSockets |
| 🖥️ **Backend** | Node.js + Express + TypeScript |
| 🤖 **AI Engine** | Groq API — Llama 3.3 70B |
| 🗄️ **Database** | MongoDB + Mongoose |
| 🚀 **Dev Tools** | Nodemon + ts-node |

</div>

---

<div align="center">

## 🏯 「 PROJECT STRUCTURE 」 🏯

</div>

```
⚡ real-time-ide/
│
├── 🖥️  client/                    # React Frontend
│   └── src/
│       ├── 🧩 components/
│       │   ├── Editor/            # Monaco Editor + AI suggestions
│       │   ├── FileTree/          # File explorer
│       │   ├── Chat/              # Live chat panel
│       │   ├── UserList/          # Active collaborators
│       │   ├── RunPanel/          # Code execution
│       │   ├── Whiteboard/        # Drawing canvas
│       │   ├── Navbar/            # Top navigation
│       │   └── Settings/          # Editor preferences
│       ├── 📄 pages/
│       │   ├── LandingPage.tsx    # Entry — join a room
│       │   └── RoomPage.tsx       # The IDE battlefield
│       └── 🔌 context/
│           └── SocketContext.tsx  # Real-time connection
│
└── ⚙️  server/                    # Node.js Backend
    └── src/
        ├── 🛣️  routes/            # API endpoints
        ├── 🎮 controllers/        # Business logic
        ├── 🔌 socket/             # Socket.io events
        ├── 🛡️  middleware/        # Auth + error handling
        └── 📊 models/             # MongoDB schemas
```

---

<div align="center">

## 🌀 「 GETTING STARTED 」 🌀

</div>

### Prerequisites — Your Ninja Gear 🥷

```bash
node --version   # v18+ required
npm --version    # v9+ required
```

### ⚙️ Installation

**1. Clone the repository**
```bash
git clone https://github.com/JAYESH-SOLMINDE/Real-Time-IDE.git
cd Real-Time-IDE
```

**2. Setup the Server**
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=3001
MONGODB_URI=            # Optional — works without it
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key   # Free at console.groq.com
```

**3. Setup the Client**
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### ▶️ Launch

```bash
# Terminal 1 — Start Server
cd server && npm run dev

# Terminal 2 — Start Client
cd client && npm run dev
```

Open **http://localhost:5173** and enter the arena. ⚔️

---

<div align="center">

## 🎮 「 HOW TO USE 」 🎮

</div>

```
Step 1 ──► Open http://localhost:5173
           │
Step 2 ──► Enter your name + a Room ID
           │
Step 3 ──► Share the Room ID with your teammate
           │
Step 4 ──► Code together in real time ⚡
           │
           ├── 📁  Files    → Create & manage files
           ├── 💬  Chat     → Talk without leaving editor  
           ├── 👥  Users    → See who's in the room
           ├── ▶️   Run      → Execute your code live
           ├── 🎨  Board    → Draw & explain ideas
           └── ⚙️  Settings → Customize your editor
```

---

<div align="center">

## 🌙 「 AI CODE SENSEI 」 🌙

</div>

The editor connects to **Groq's Llama 3.3 70B** — one of the fastest and smartest free AI models available.

```
You type:          function calculateTotal(items) {
                     let total = 0;
                     for (let i = 0; i <

AI whispers:  ►    items.length; i++) {
                       total += items[i].price;
                     }
                     return total;
                   }

You press Tab. Magic happens. ✨
```

Get your **free** Groq API key at [console.groq.com](https://console.groq.com) — no credit card needed.

---

<div align="center">

## 🖌️ 「 WHITEBOARD TOOLS 」 🖌️

</div>

<div align="center">

| Tool | Description |
|:----:|:------------|
| ✏️ **Pen** | Smooth bezier curves |
| 🖌️ **Brush** | Soft glowing brush strokes |
| 🖋️ **Fountain** | Variable width calligraphy pen |
| 🧹 **Eraser** | Clean up mistakes |
| ╱ **Line** | Perfect straight lines |
| ▭ **Rectangle** | Boxes and containers |
| ○ **Ellipse** | Circles and ovals |
| → **Arrow** | Connect your ideas |
| **T** **Text** | Type anywhere on canvas |

</div>

Keyboard shortcuts: `Cmd+Z` undo · `Cmd+Shift+Z` redo · `Esc` cancel

---

<div align="center">

## 🌺 「 SUPPORTED LANGUAGES 」 🌺

</div>

<div align="center">

`JavaScript` · `TypeScript` · `Python` · `Java` · `C++` · `C` · `Go` · `Rust` · `HTML` · `CSS` · `JSON` · `Markdown`

</div>

---

<div align="center">

## 🔮 「 ROADMAP 」 🔮

</div>

- [x] Real-time code collaboration
- [x] AI code suggestions
- [x] Whiteboard with drawing tools
- [x] Code execution engine
- [x] Live chat
- [ ] 🔜 Voice chat between collaborators
- [ ] 🔜 GitHub integration — commit directly
- [ ] 🔜 Terminal emulator in browser
- [ ] 🔜 Multiplayer cursor labels
- [ ] 🔜 Room persistence with MongoDB

---

<div align="center">

## ⚡ 「 MADE BY 」 ⚡

<br/>

**JAYESH SOLMINDE**

*"The code is strong with this one."*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-JAYESH--SOLMINDE-818cf8?style=for-the-badge&logo=github&logoColor=white&labelColor=0d0d1a)](https://github.com/JAYESH-SOLMINDE)

<br/>

---

*Built with* ⚡ *and way too much caffeine.*

*If this helped you, drop a* ⭐ *— it means everything.*

```
    /\_____/\
   /  o   o  \
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)
   Real Time IDE
```

</div>