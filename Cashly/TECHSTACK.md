# 🛠️ Tech Stack & Architecture | Cashly

Cashly is a next-generation AI-powered financial management platform designed specifically for Indian small and medium businesses (SMBs). It simplifies complex financial data into actionable insights through an agentic AI architecture.

---

## 🏗️ System Architecture

Cashly follows a **Modern MERN Architecture** with an **Agentic AI Layer**:

1.  **Frontend (Presentation Layer):** A high-performance, responsive SPA built with React and Vite, utilizing a component-based architecture for modularity.
2.  **Backend (Application Layer):** A Node.js and Express server handling business logic, authentication, and the orchestration of the AI Agent.
3.  **Database (Data Layer):** MongoDB Atlas for flexible, document-based storage of financial records, inventory, and user data.
4.  **AI Layer (Intelligence Layer):** A custom-built **LangChain-powered Agentic AI System** that uses OpenRouter to access state-of-the-art LLMs (like Llama 3.2), combined with a dedicated "Tool-Calling" framework to interact with real business data.

---

## 💻 Technolgies Used

### **Frontend**
- **React (Vite):** Fast Refresh and optimized build pipeline.
- **Tailwind CSS:** For a modern, premium UI with "Glassmorphism" and custom animations.
- **Recharts:** Interactive data visualization for sales, expenses, and cash flow forecasts.
- **Lucide React:** Consistent, high-quality iconography.
- **Axios:** For seamless communication with the backend.
- **Framer Motion:** Smooth micro-interactions and transitions (Health Score gauge).

### **Backend**
- **Node.js & Express:** Scalable event-driven backend.
- **MongoDB & Mongoose:** NoSQL database for flexible financial data models.
- **LangChain:** Orchestrating the AI agent logic, tool planning, and memory management.
- **OpenAI Node SDK:** Orchestrating LLM calls via OpenRouter.
- **JWT (JSON Web Tokens):** Secure, stateless user authentication.
- **Bcrypt.js:** Industry-standard password hashing.

### **AI Tools**
- **LangChain Framework:** Utilizing LangChain for sophisticated agent reasoning and chain-of-thought processing.
- **OpenRouter API:** Access to various LLMs (Meta Llama 3.2) with cross-model failover logic.
- **Custom Agent Framework:** A tool-selection engine integrated with LangChain that intelligently decides which financial data to fetch based on user queries.

---

## 🧠 Special Features
- **Cash Runway Analysis:** Predictive calculation showng days until cash depletion with an interactive AI breakdown.
- **Business Health Score:** A complex mathematical model weighing profitability, receivables, and runway.
- **Forecast Simulation:** Monte Carlo-inspired simulation logic to predict future cash balances.
- **Anomaly Detection:** Real-time scanning of expenses to find unusual patterns or spikes.

---

## 🎤 Expected Jury Questions & Answers

### **Q1: How does the AI Agent ensure it provides accurate data?**
> **Answer:** The agent doesn't "hallucinate" numbers. We implemented a strict **Tool-Calling Architecture**. When a user asks a question, the agent first "plans" which data it needs (e.g., `getReceivables`), executes code to fetch the *actual* database records, and only then uses the LLM to interpret that factual data.

### **Q2: Why did you choose MongoDB over a SQL database for financial data?**
> **Answer:** Financial data for SMBs varies significantly. Some businesses track SKU-level inventory, while others just track broad expenses. MongoDB’s schema-less nature allows us to store diverse transaction types without complex migrations, offering the flexibility needed for a multi-tenant business tool.

### **Q3: What makes your "Cash Runway" better than a simple spreadsheet calculation?**
> **Answer:** Our runway isn't just `Cash / Expenses`. It factors in **Net Daily Burn** (Income - Expenses) and **Receivables Health**. It also offers a "Collection Improvement" simulation, showing the user exactly how many days of runway they gain by collecting pending invoices.

### **Q4: How do you handle API failures from the LLM provider?**
> **Answer:** We built a **Failover Mechanism**. If the primary OpenRouter API key fails or hits a rate limit, the system automatically switches to a backup key. If all LLM services are down, the agent falls back to a locally generated mathematical report so the user is never left without answers.

### **Q5: Is the application secure for sensitive financial data?**
> **Answer:** Security is a priority. We use **JWT-based authentication** for session management and **Bcrypt** for at-rest password encryption. Financial summaries are computed in memory on the server and never stored in a way that maps them back to identifiable PII without proper authorization.

### **Q6: How do you handle deep analysis of long-term data?**
> **Answer:** We use the `getCashFlow` and `getSalesData` tools to aggregate monthly and daily patterns. The AI Agent is prompted to look for trends (like 69% profit margins or 16 overdue invoices) to provide high-level strategic advice rather than just reading out line items.

### **Q7: Why did you use LangChain instead of direct LLM calls?**
> **Answer:** We used **LangChain** because it provides a standardized framework for building **Agentic Workflows**. It allows us to implement "Chain-of-Thought" reasoning where the AI can think, pick a tool, observe the results, and then refine its answer. This is much more powerful than a single LLM prompt because it gives the AI access to our real-time business data through custom tool definitions.
