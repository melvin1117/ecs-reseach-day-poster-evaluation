# 🍊 Cuse-Rank: Research Day Evaluation System

## 📌 Introduction & Description
Cuse-Rank is a **web-based research poster evaluation system** designed to streamline the evaluation process for research day events. The system enables:
- **Admins** to create and manage research events.
- **Organizers** to upload research posters and assign judging criteria.
- **Judges** to evaluate assigned posters based on configurable criteria.
- **ML Processing** to intelligently assign judges to posters based on expertise.
- **Live Ranking System** to update rankings as judges submit evaluations.

The system ensures a seamless evaluation process with a user-friendly interface and backend automation.

---

## 🛠️ Tech Stack
- **Frontend**: Angular
- **Backend**: NestJS (TypeORM, PostgreSQL)
- **ML Processing**: FastAPI, Celery, Redis
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker-Compose

---

## 📐 System Architecture
```
Frontend (Angular)  <--->  Backend (NestJS)  <--->  Database (PostgreSQL)
                                   |
                                   v
                   ML Processing (FastAPI + Celery + Redis)
```
This architecture enables **modular, scalable, and efficient** handling of research day evaluations, ensuring smooth processing and real-time ranking updates.

---

## 📁 Project Structure
```
cuse-rank/
│── cuse-rank-fe/          # Angular Frontend
│── cuse-rank-be/          # NestJS Backend
│── cuse-rank-algo/        # FastAPI + Celery (ML Processing)
│── redis/                 # Redis for Celery task queue
│── db/                    # PostgreSQL Database
│── docker-compose.yml     # Docker orchestration
│── README.md              # Documentation
```

---

## 🔗 Database ER Diagram
View the **database schema & entity relationships** here:  
[📊 Cuse-Rank ER Diagram](https://dbdiagram.io/d/poster-evaluation-67a6b995263d6cf9a0713c4c)

---

## 🚀 Features
- ✅ **Admin Dashboard**: Create and manage research events.
- ✅ **Organizer Portal**: Upload research posters, assign judges, configure scoring criteria.
- ✅ **Judge Interface**: Evaluate assigned posters based on predefined criteria.
- ✅ **ML-Based Poster-Judge Mapping**: Uses FastAPI + Celery for intelligent mapping.
- ✅ **Live Ranking System**: Automatic ranking updates based on judge scores.
- ✅ **Secure Authentication & Authorization**: Role-based access for admins, organizers, and judges.
- ✅ **PostgreSQL with ORM (TypeORM + SQLAlchemy)**: Scalable and efficient database handling.
- ✅ **Dockerized Deployment**: Easy setup for local development and cloud hosting.

---

## 🚀 Setup & Installation (Docker)

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo.git
cd cuse-rank
```

### **2️⃣ Build and Start Containers**
```sh
docker-compose up --build
```
✅ **This will start all modules in Docker containers.**

---

## 📌 How to Run

### **Running the System with Docker**
After running `docker-compose up --build`, the following services will be available:
- **Frontend (Angular)** → `http://localhost:80`
- **Backend API (NestJS)** → `http://localhost:5000`
- **ML API (FastAPI + Celery)** → `http://localhost:8000`
- **Redis (Task Queue)** → `localhost:6379`
- **Database UI (Adminer)** → `http://localhost:8080`

---

## 📌 Running Modules Individually (Without Docker)
If you prefer to run modules separately, follow these steps:

### **Frontend (Angular)**
```sh
cd cuse-rank-fe
npm install
npm start
```
🟢 Runs on `http://localhost:4200`

### **Backend API (NestJS)**
```sh
cd cuse-rank-be
npm install
npm run start
```
🟢 Runs on `http://localhost:5000`

### **ML Processing (FastAPI + Celery + Redis)**
#### **Start FastAPI**
```sh
cd cuse-rank-algo
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```
🟢 Runs on `http://localhost:8000`

#### **Start Redis** (If not using Docker)
```sh
redis-server
```
🟢 Runs on `localhost:6379`

#### **Start Celery Worker**
```sh
celery -A celery_worker.celery_app worker --loglevel=info
```

---

## 📌 How to Contribute
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

