<div align="center">

# 💰 Cashly Intelligence System

### *Predict the unpredictable. Master your business liquidity with AI-driven foresight.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![LangChain](https://img.shields.io/badge/LangChain-AI-00D4AA?style=for-the-badge)](https://langchain.com/)

</div>

---

## 🚀 Overview

**Cashly** is not just a ledger—it's an **autonomous financial co-pilot** powered by cutting-edge AI. Designed for modern founders and small-to-medium businesses (SMBs), Cashly transforms raw transaction data into actionable survival strategies through sophisticated agentic AI architecture.

### ✨ What Makes Cashly Different?

- 🧠 **AI-Powered Analysis**: LangChain-based agentic system with tool-calling capabilities
- 📊 **Real-Time Intelligence**: Live financial telemetry and health scoring
- 🎯 **Predictive Forecasting**: Multi-variable regression for cash flow predictions
- ⚡ **Sub-Second Response**: Optimized caching layer for instant insights
- 🎨 **Premium UX**: Mission-control interface with glassmorphism and micro-animations
- 🛡️ **Enterprise Security**: JWT authentication with Bcrypt encryption

---

## 🎯 Core Features

### 1️⃣ AI Analysis Center (The Neural Hub)

- **Deep Reasoning Engine**: Multi-layer intent classification (Strategic, Existential, Tactical)
- **Live Telemetry Dashboard**: Real-time visualization of cognitive load and financial velocity
- **Situation Room**: High-accuracy command center with runway metrics and health scores
- **Natural Language Queries**: Ask complex financial questions in plain English

### 2️⃣ Smart Financial Management

- **Cash Runway Analysis**: Predictive calculation showing days until cash depletion
- **Business Health Score**: Complex mathematical model weighing profitability and receivables
- **Forecast Simulation**: Monte Carlo-inspired logic for future cash balance prediction
- **Anomaly Detection**: Real-time expense pattern analysis and spike identification

### 3️⃣ Comprehensive Dashboards

- **Analytics Dashboard**: Interactive charts with Recharts visualization
- **Transaction Management**: Complete CRUD operations for income/expenses
- **Inventory Tracking**: SKU-level product management
- **Receivables/Payables**: Overdue invoice tracking and payment management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard │  │AI Analysis│  │Analytics │  │  Setup   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Axios HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                  SERVER (Node.js + Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │   API    │  │  Agent   │  │  Tools   │  │
│  │Middleware│  │Controllers│  │Orchestr. │  │Framework │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐            ┌────────▼────────┐
│  MongoDB Atlas  │            │  LangChain AI   │
│  (Data Layer)   │            │  (OpenRouter)   │
└─────────────────┘            └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite** - Lightning-fast development and HMR
- **TailwindCSS 4** - Utility-first styling with custom themes
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization
- **Lucide React** - Consistent, beautiful iconography
- **Axios** - Promise-based HTTP client

### Backend
- **Node.js & Express** - Scalable event-driven architecture
- **MongoDB & Mongoose** - Flexible NoSQL database
- **LangChain** - AI agent orchestration framework
- **OpenRouter API** - Multi-model LLM access (Llama 3.2)
- **JWT** - Secure stateless authentication
- **Bcrypt.js** - Industry-standard password hashing

### AI/ML Layer
- **LangChain Framework** - Chain-of-thought reasoning
- **Custom Agent System** - Tool-selection engine
- **OpenRouter** - Cross-model LLM failover
- **Predictive Analytics** - Cash flow forecasting algorithms

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/2006-2006/Cashly.git
cd Cashly/Cashly
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create a `.env` file in the `server` directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_super_secure_secret_key

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

5. **Initialize the database**
```bash
# From the Cashly directory
cd server
node scripts/initDatabase.js
```

### Running the Application

**Development Mode** (Recommended)

```bash
# Terminal 1 - Start the backend server
cd server
npm run dev

# Terminal 2 - Start the frontend client
cd client
npm run dev
```

**Production Mode**

```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📁 Project Structure

```
Cashly/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API integration layer
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context providers
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Route-based page components
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── agent/            # LangChain AI agent logic
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── scripts/          # Utility scripts
│   ├── services/         # Business logic services
│   ├── .env.example      # Environment template
│   ├── package.json
│   └── server.js         # Entry point
│
├── CREATE_TABLES.sql      # Database schema
├── DEPLOYMENT.md          # Deployment guide
├── QUICK_START.md         # Quick start guide
├── SYSTEM_DOCUMENTATION.md # System documentation
└── TECHSTACK.md           # Technical specifications
```

---

## 🎨 Key Highlights

### AI Agent Architecture

Cashly's AI doesn't hallucinate numbers. The **Tool-Calling Architecture** ensures:

1. **Planning Phase**: Agent determines required data tools
2. **Execution Phase**: Fetches actual database records
3. **Interpretation Phase**: LLM analyzes factual data
4. **Response Phase**: Delivers actionable insights

### Business Intelligence

- **Cash Runway**: Not just `Cash / Expenses` - factors in Net Daily Burn and Receivables Health
- **Health Score**: Weighted algorithm considering profitability, runway, and payment cycles
- **Anomaly Detection**: Statistical analysis to identify unusual spending patterns
- **Predictive Forecasting**: Machine learning models for future cash position

### Security & Performance

- **Authentication**: JWT-based with secure HTTP-only cookies
- **Encryption**: Bcrypt password hashing (10 rounds)
- **Rate Limiting**: API endpoint protection
- **Error Handling**: Graceful degradation with fallback responses
- **Caching**: Intelligent query caching for sub-second response times

---

## 📊 Screenshots

> *Coming Soon: Dashboard, AI Analysis, and Analytics views*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yogeshwaran V**

- 🎓 B.Tech in AI & Data Science (Pre-final year)
- 🔗 LinkedIn: [yogeshwaran-v-362802274](https://www.linkedin.com/in/yogeshwaran-v-362802274/)
- 💻 GitHub: [@2006-2006](https://github.com/2006-2006)
- 🏆 Google Agentathon 2025 Participant

---

## 🙏 Acknowledgments

- Built with ❤️ for the modern entrepreneur
- Powered by cutting-edge AI and modern web technologies
- Designed for real-world financial intelligence

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with precision. Predictive by nature. Cashly is the pulse of your business.**

[Report Bug](https://github.com/2006-2006/Cashly/issues) · [Request Feature](https://github.com/2006-2006/Cashly/issues) · [Documentation](https://github.com/2006-2006/Cashly/wiki)

</div>
