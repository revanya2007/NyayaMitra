# ⚖️ NyayaMitra
### *AI-Powered Legal Assistance & Government Scheme Guidance System for Farmers*

---

> **"Bridging the gap between farmers and the law — one conversation at a time."**

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Objectives](#-objectives)
- [Requirements](#-requirements)
- [System Modules](#-system-modules)
- [Users](#-users)
- [Database Design](#-database-design)
- [Conclusion](#-conclusion)

---

## 🌿 Project Overview

**NyayaMitra** is a web-based intelligent assistant designed to help farmers understand their legal rights, access government welfare schemes, resolve land-related queries, and obtain basic legal guidance through an AI-powered chatbot interface.

| Property | Details |
|----------|---------|
| 🏷️ **Project Name** | NyayaMitra |
| 🤖 **AI Engine** | Gemini API |
| 🗄️ **Database** | Supabase (PostgreSQL) |
| 🎯 **Target Users** | Farmers, Agricultural Workers, Rural Citizens |
| 🌐 **Platform** | Responsive Web Application |
| 🔮 **Future Scope** | Voice Support, Multilingual Interface |

---

## 🎯 Objectives

### 🔹 Primary Objective

> Develop an AI-powered legal assistance platform that provides farmers with **easy-to-understand information** regarding legal matters, government schemes, and agricultural rights.

### 🔸 Secondary Objectives

| # | Objective |
|---|-----------|
| 1 | Simplify legal information for rural users |
| 2 | Improve awareness of government welfare schemes |
| 3 | Reduce dependency on intermediaries for basic legal guidance |
| 4 | Provide multilingual support in future versions |
| 5 | Enable quick access through AI-driven conversations |

### ✅ Expected Outcomes

- ⚡ Faster access to legal information
- 📚 Improved farmer awareness
- 💰 Better utilization of government schemes
- 📱 Enhanced digital accessibility for rural communities

---

## 📋 Requirements

### ⚙️ Functional Requirements

#### 👤 User Requirements
- Farmers can ask legal questions
- Users receive AI-generated responses
- Access to previous queries and responses
- Information on government schemes
- Guidance on land rights and disputes
- Text-based communication interface
- Voice-based interaction *(future)*

#### 🖥️ System Requirements
- Secure storage of user queries and responses
- Integration with AI services (Gemini API)
- Responsive web interface
- Database for chat history and legal FAQs
- Historical conversation retrieval

---

### 🚀 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| 🎨 **Usability** | User-friendly interface |
| ⚡ **Performance** | Fast response time |
| ☁️ **Reliability** | Reliable cloud database |
| 📈 **Scalability** | Future-ready architecture |
| 📱 **Accessibility** | Mobile-responsive design |
| 🔒 **Security** | Secure API communication |

---

## 🧩 System Modules

### Module 1 — User Interface Module

> *Provides interaction between users and the system.*

```
Features:
  ├── Chat interface
  ├── Input forms
  ├── Responsive design
  └── Navigation dashboard
```

---

### Module 2 — AI Assistance Module

> *Processes user questions and generates responses using Gemini API.*

```
Features:
  ├── Question analysis
  ├── Response generation
  └── Context-based assistance
```

---

### Module 3 — Legal Guidance Module

> *Provides information related to legal rights and disputes.*

```
Features:
  ├── Land dispute guidance
  ├── Property rights information
  └── Legal awareness support
```

---

### Module 4 — Government Scheme Module

> *Provides information regarding agricultural and welfare schemes.*

```
Features:
  ├── PM-KISAN information
  ├── Crop insurance details
  ├── Subsidy guidance
  └── Eligibility information
```

---

### Module 5 — Database Management Module

> *Stores and retrieves system data.*

```
Features:
  ├── Query storage
  ├── Response storage
  ├── FAQ management
  └── History retrieval
```

---

### Module 6 — Voice Support Module *(Future Enhancement)*

> *Allows voice-based interaction for improved rural accessibility.*

```
Features:
  ├── Speech-to-Text
  ├── Text-to-Speech
  └── Multilingual support
```

---

## 👥 Users

### Primary Users

| User | Role |
|------|------|
| 🧑‍🌾 **Farmers** | Core beneficiaries of the platform |
| 👷 **Agricultural Workers** | Field workers needing scheme guidance |
| 🏘️ **Rural Citizens** | General rural population seeking legal help |

### Secondary Users

| User | Role |
|------|------|
| 🛡️ **Project Administrators** | System maintenance and moderation |
| 🔬 **Researchers** | Data analysis and insights |
| 🏛️ **Government Personnel** | Outreach and scheme monitoring |

---

## 🗄️ Database Design

**Platform:** Supabase (PostgreSQL)

### Database Objectives

- Store user queries
- Store AI-generated responses
- Maintain conversation history
- Store legal FAQs
- Support future analytics and reporting

---

### Table 1 — `user_queries`

| Column | Data Type | Description |
|--------|-----------|-------------|
| `id` | `BIGINT` | Primary Key (auto-generated) |
| `query` | `TEXT` | User's question |
| `response` | `TEXT` | AI-generated response |
| `timestamp` | `TIMESTAMPTZ` | Date and time of query |

```sql
CREATE TABLE user_queries (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    query     TEXT,
    response  TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table 2 — `legal_faqs`

| Column | Data Type | Description |
|--------|-----------|-------------|
| `id` | `BIGINT` | Primary Key (auto-generated) |
| `question` | `TEXT` | FAQ question |
| `answer` | `TEXT` | FAQ answer |
| `category` | `TEXT` | Topic category |

```sql
CREATE TABLE legal_faqs (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question TEXT,
    answer   TEXT,
    category TEXT
);
```

---

### Entity Relationship Overview

```
┌─────────────────────┐         ┌─────────────────────┐
│     user_queries    │         │      legal_faqs      │
├─────────────────────┤         ├─────────────────────┤
│ id         BIGINT   │         │ id         BIGINT    │
│ query      TEXT     │         │ question   TEXT      │
│ response   TEXT     │         │ answer     TEXT      │
│ timestamp  TIMESTAMPTZ        │ category   TEXT      │
└─────────────────────┘         └─────────────────────┘
```

---

## 🏁 Conclusion

**NyayaMitra** aims to bridge the gap between farmers and legal information through an AI-powered platform. The project combines:

| Layer | Technology |
|-------|-----------|
| 🤖 AI | Gemini API |
| 🗄️ Database | Supabase (PostgreSQL) |
| 🌐 Frontend | Responsive Web |
| 🔮 Future | Voice + Multilingual |

The proposed architecture and database design support **future scalability**, **multilingual capabilities**, and **voice-based interactions** — making legal guidance accessible to every farmer in India.

---

<div align="center">

*Made with ❤️ for Indian Farmers*

**NyayaMitra — न्यायमित्र**

</div>
