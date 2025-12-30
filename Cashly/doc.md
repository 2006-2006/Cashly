# Cashly System Documentation

## 1. System Overview

**Cashly** is an AI-powered cash flow forecasting tool designed for MSME electronics retailers. It helps owners prevent short-term cash crunches by predicting daily cash balances and offering actionable advice.

### Key Value Propositions
*   **Preventative**: "Prevent cash problems before they happen."
*   **Simple Input**: Works with existing Excel/CSV exports.
*   **Explainable AI**: Translates financial data into plain English advice.
*   **Local-First**: Runs securely on the user's machine (for now).

---

## 2. Architecture

The system follows a standard **MERN Stack** (MongoDB, Express, React, Node.js) architecture.

### High-Level Diagram
```mermaid
graph TD
    User[Store Owner] -->|Access via Browser| Client[React Frontend (Vite)]
    Client -->|REST API Requests| Server[Node.js + Express Backend]
    
    subgraph "Backend Services"
        Server -->|Auth & Data Storage| DB[(MongoDB)]
        Server -->|Parses Excel| FileProcessor[SheetJS / Multer]
        Server -->|Generates Advisory| AI[Google Gemini API]
    end
    
    subgraph "Core Logic"
        Server -->|Calculates| ForecastEngine[Forecasting Algorithm]
    end
```

### Components

1.  **Frontend (Client)**
    *   **Framework**: React 18 + Vite
    *   **Styling**: Vanilla CSS (Google Material Theme)
    *   **Routing**: React Router DOM
    *   **State**: Context API (`AuthContext`)
    *   **Charts**: Recharts
    *   **HTTP**: Axios

2.  **Backend (Server)**
    *   **Runtime**: Node.js
    *   **Framework**: Express.js
    *   **Database**: MongoDB (Mongoose ORM)
    *   **Auth**: JWT (JSON Web Tokens) + BCrypt
    *   **AI Integration**: @google/generative-ai SDK

---

## 3. Database Schema

### `User`
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full name |
| `email` | String | Unique login email |
| `password` | String | Hashed password |

### `Sale`
| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | Date | Transaction date |
| `amount` | Number | Total sale amount |
| `paymentType` | String | Cash, UPI, Card, etc. |

### `Expense`
| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | Date | Expense date |
| `amount` | Number | Cost incurred |
| `expenseType` | String | Rent, Salary, Bill, etc. |

### `Inventory`
| Field | Type | Description |
| :--- | :--- | :--- |
| `itemName` | String | Product name |
| `reorderCost` | Number | Cost to restock |
| `expectedPaymentDate`| Date | When cash outflow occurs |

### `Receivable`
| Field | Type | Description |
| :--- | :--- | :--- |
| `customerName` | String | Debtor name |
| `amountDue` | Number | Incoming cash |
| `expectedPaymentDate`| Date | When cash inflow occurs |

---

## 4. API Endpoints

### Authentication
*   `POST /api/users` - Register a new user
*   `POST /api/users/login` - Authenticate and get Token
*   `GET /api/users/me` - Get current user profile (Protected)

### Data Upload
*   `POST /api/upload/sales` - Upload Sales Excel
*   `POST /api/upload/expenses` - Upload Expenses Excel
*   `POST /api/upload/inventory` - Upload Inventory Excel
*   `POST /api/upload/receivables` - Upload Receivables Excel

### Core Features
*   `POST /api/forecast/run` - Calculate 30-day cash forecast
*   `GET /api/data/*` - Retrieve uploaded data for table views
*   `POST /api/ai/explain` - Generate AI text advisory based on forecast data

---

## 5. Forecasting Logic

The forecasting engine uses a deterministic algorithm rather than ML for reliability with small datasets.

1.  **Sales Smoothing**: Calculates a 30-day moving average of daily sales to predict future daily inflows.
2.  **Daily Projection**: Iterates through the next 30 days.
    *   `Daily Balance = Previous Balance + Predicted Sales + Receivables(due today) - Expenses(due today) - InventoryPayments(due today)`
3.  **Risk Classification**:
    *   **Critical**: Runway < 7 Days
    *   **High Risk**: Runway < 14 Days
    *   **Warning**: Runway < 30 Days
    *   **Safe**: Runway > 30 Days

---

## 6. AI Integration

*   **Model**: Google Gemini 1.5 Flash
*   **Prompt Engineering**: The system feeds the raw forecast numbers (Lowest Balance, Runway Days, Major Expenses) to Gemini and asks it to act as a "Financial Advisor for an Electronics Shop Owner".
*   **Safety**: Returns only text advice, no financial guarantees.
