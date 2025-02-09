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

## 🧭 Tech Stack
- **Frontend**: Angular
- **Backend**: NestJS (TypeORM, PostgreSQL)
- **ML Processing**: FastAPI, Celery, Redis
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker-Compose
- **Scraping & Data Processing**: Selenium, Pandas, PostgreSQL, Psycopg2
- **Judge Allocation Algorithm**: OR-Tools, Sentence Transformers, SQLAlchemy, Celery
- **Scoring & Ranking Algorithm**: TypeORM, NestJS, PostgreSQL

---

## 💪 System Architecture
```
Frontend (Angular)  <--->  Backend (NestJS)  <--->  Database (PostgreSQL)
                                   |
                                   v
                   ML Processing (FastAPI + Celery + Redis)
                                   |
                                   v
                         Faculty Scraper (Selenium + PostgreSQL)
                                   |
                                   v
                   Judge Allocation Algorithm (OR-Tools + NLP)
                                   |
                                   v
                  Scoring & Ranking Algorithm (NestJS + PostgreSQL)
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

## 💪 Scraper Module
### **Overview**
The **scraper module** automates the extraction of faculty data from the **Syracuse University ECS Faculty website**. It retrieves **faculty names, emails, degrees, profile details, and image links**, stores the extracted data in a CSV file, and uploads it into the database.

### **Tech Stack**
- **Web Scraping**: Selenium
- **Data Processing**: Pandas
- **Database Integration**: PostgreSQL, Psycopg2

### **Working of Scraper**
1. **Initialize Selenium WebDriver**:
   - Uses `webdriver.Chrome()` to open the faculty directory.
   - Waits for faculty profile elements to load.
2. **Extract Faculty Information**:
   - Iterates over each profile, extracting **name, email, degrees, details, and profile images**.
   - Uses JavaScript-based clicking to navigate dynamically loaded pages.
3. **Save Data to CSV**:
   - Stores extracted information in a Pandas DataFrame and writes it to `faculty_data.csv`.
4. **Post Data to Database**:
   - Reads `faculty_data.csv` and inserts data into the `judges_master` table.
   - Uses `ON CONFLICT (email) DO NOTHING` to prevent duplicate insertions.

This module ensures that the system has **an up-to-date list of judges**, mapped directly from the ECS Faculty directory.

---

## 💪 Poster Judge Allocation Algorithm
### **Overview**
The **judge allocation algorithm** ensures that each research poster is assigned **exactly 2 judges**, while each judge evaluates **at most 6 posters** based on availability and expertise. The algorithm maximizes fairness and relevance by computing **semantic similarity** between poster abstracts and judge expertise using **Sentence Transformers** and optimizes allocations using **Google OR-Tools**.

### **Tech Stack**
- **Optimization Framework**: OR-Tools (Google Constraint Programming)
- **Similarity Computation**: Sentence Transformers, Cosine Similarity
- **Database Operations**: SQLAlchemy, PostgreSQL
- **Task Processing**: Celery

### **Working of Algorithm**
1. **Data Preparation**:
   - Loads **judges and posters** from the database.
   - Cleans expertise descriptions and abstracts for similarity computation.
2. **Computing Judge-Poster Similarity**:
   - Uses **Sentence Transformers ('all-MiniLM-L6-v2')** to encode **judge expertise** and **poster abstracts**.
   - Computes **cosine similarity** between judge and poster embeddings.
3. **Optimization Model (OR-Tools)**:
   - Ensures each **poster is assigned exactly 2 judges**.
   - Limits each **judge to evaluate a maximum of 6 posters**.
   - Ensures **judges are available** during the assigned poster’s session.
   - **Maximizes overall similarity score** for best judge-poster fit.
4. **Storing Assignments in Database**:
   - Inserts final **judge-poster assignments** into the `judge_assignments` table.
   - Uses `ON CONFLICT` to prevent duplicate assignments.

This algorithm ensures **fairness, expertise-based allocation, and efficient scheduling** for the research evaluation process.

---

## 💪 Scoring & Ranking Algorithm
### **Overview**
The **scoring and ranking algorithm** processes **evaluations submitted by judges** to compute the final poster rankings. The algorithm applies **weight normalization**, **relevance-weighted scoring**, and ensures **fair ranking** by balancing diverse judging criteria.

### **Tech Stack**
- **Backend Framework**: NestJS
- **Database Management**: PostgreSQL (TypeORM)
- **Weight Normalization & Aggregation**: TypeScript

### **Working of Algorithm**
1. **Fetch Evaluations & Posters**:
   - Retrieves **evaluations** linked to each poster.
   - Loads event-specific **criteria weightage** from the database.
2. **Compute Weighted Scores**:
   - Normalizes weightage across criteria.
   - Computes weighted scores per judge evaluation.
   - Adjusts scores based on **judge expertise relevance**.
3. **Calculate Final Rankings**:
   - Averages scores across assigned judges.
   - Generates **rankings based on weighted final scores**.
4. **Store Rankings in Database**:
   - Inserts computed rankings into the `rankings` table.
   - Ensures **correct referencing of event and poster entities**.

This scoring system provides **real-time rankings** and ensures **fair, criteria-based evaluation** for research poster presentations.

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

