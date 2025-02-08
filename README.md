# 🍊 Cuse-Rank: Research Day Evaluation System

## 📌 Overview
Cuse-Rank is a **web-based research poster evaluation system** designed to streamline the evaluation process for research day events. The system consists of:
- **Frontend (Angular)**: User interface for admins, organizers, and judges.
- **Backend (NestJS + TypeORM)**: Handles user authentication, event creation, and data storage.
- **ML Processing (FastAPI + Celery + Redis)**: Manages judge-poster assignments and ranking algorithms.
- **Database (PostgreSQL)**: Stores event, user, and evaluation data.
- **Adminer**: A lightweight web-based database management tool.

## 📁 Project Structure
```
cuse-rank/
│── cuse-rank-fe/          # Angular Frontend
│── cuse-rank-be/          # NestJS Backend
│── cuse-rank-algo/        # FastAPI + Celery (ML Processing)
│── redis/                 # Redis for Celery task queue
│── db/                    # PostgreSQL Database
│── adminer/               # Database UI (Adminer)
│── docker-compose.yml     # Docker orchestration
│── README.md              # Documentation
```

## 🛠️ Technologies Used
- **Frontend**: Angular, Angular Material
- **Backend**: NestJS, TypeORM
- **ML Processing**: FastAPI, Celery, Redis
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker-Compose

---

## 🚀 Setup & Installation

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/melvin1117/ecs-reseach-day-poster-evaluation.git
cd ecs-reseach-day-poster-evaluation
```

### **2️⃣ Install Dependencies for Each Module**
#### 🔹 **Frontend (Angular)**
```sh
cd cuse-rank-fe
npm install
```
#### 🔹 **Backend (NestJS)**
```sh
cd ../cuse-rank-be
npm install
```
#### 🔹 **ML Processing (FastAPI + Celery)**
```sh
cd ../cuse-rank-algo
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

### **3️⃣ Running with Docker**
```sh
cd cuse-rank
docker-compose up --build
```
✅ **Services Started:**
- Frontend → `http://localhost`
- Backend API → `http://localhost:5000`
- ML API (FastAPI) → `http://localhost:8000`
- Redis (Task Queue) → `localhost:6379`
- Database UI (Adminer) → `http://localhost:8080`

---

## 🏗️ Architecture
- **Admins** create and manage research events.
- **Organizers** upload research posters and assign judging criteria.
- **Judges** evaluate assigned posters based on configurable criteria.
- **ML Module** intelligently assigns judges to posters based on expertise.
- **Ranking System** updates rankings as judges submit evaluations.

---

## 🤝 Contributing
### **1️⃣ Fork & Clone the Repository**
```sh
git clone https://github.com/your-repo.git
cd cuse-rank
```
### **2️⃣ Create a New Branch**
```sh
git checkout -b feature-branch
```
### **3️⃣ Make Changes & Commit**
```sh
git add .
git commit -m "Added new feature"
```
### **4️⃣ Push Changes & Create a Pull Request**
```sh
git push origin feature-branch
```
---

## 📝 License
This project is licensed under the **MIT License**.

📩 **For questions or contributions, contact:** `your-email@example.com`

