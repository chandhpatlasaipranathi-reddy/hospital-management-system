# Hospital Management System — Full Stack Java

Educational technical-training project: **React + CSS frontend**, **Spring Boot REST API**, **MySQL database**, **CRUD operations**, and **JWT login**.

## Features
- Register and log in with JWT authentication
- CRUD operations for patients, doctors, and appointments
- Search/list records in the dashboard
- Responsive React interface
- MySQL persistence
- Health endpoint: `GET http://localhost:8080/api/health`

> Use fictional demo records only. This is a student project, not a production-ready clinical system.

## Requirements on Windows
Install:
1. JDK 17 or newer
2. Apache Maven 3.9+
3. Node.js 20+
4. MySQL 8+
5. VS Code (recommended extensions: Extension Pack for Java)

Confirm installation in a NEW VS Code terminal:
```powershell
java -version
mvn -version
node -v
npm -v
```

## Step 1 — Open the project
Extract the ZIP. In VS Code choose **File → Open Folder** and select the extracted `hospital-management-system` folder. Do not open only the `backend` folder if you want both parts visible.

## Step 2 — Prepare MySQL
Start MySQL, then run this SQL in MySQL Workbench or the MySQL terminal:
```sql
CREATE DATABASE hospital_db;
```

Open `backend/src/main/resources/application.properties` and set the username/password for your local MySQL:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
Replace `YOUR_MYSQL_PASSWORD` with your actual local MySQL password. Never commit real passwords to GitHub. The project uses a demo JWT secret for local learning; change it for deployment.

## Step 3 — Run backend
Open a VS Code terminal (**Terminal → New Terminal**) and run:
```powershell
cd backend
mvn clean compile
mvn spring-boot:run
```
Keep this terminal open. Backend URL: `http://localhost:8080`.

If Maven says `mvn` is not recognized, install Maven and add its `bin` folder to Windows PATH, then restart VS Code. If MySQL connection fails, check MySQL is running and your username/password are correct.

## Step 4 — Run frontend
Open a **second** VS Code terminal using the plus (+) button. From the project root run:
```powershell
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite, usually `http://localhost:5173`.

## Demo workflow
1. Register a username and password (at least 6 characters).
2. Log in.
3. Add doctor and patient records.
4. Create an appointment using an existing patient ID and doctor ID.

## API overview
- `POST /api/auth/register` — register
- `POST /api/auth/login` — login and receive JWT
- `/api/patients` — patient CRUD
- `/api/doctors` — doctor CRUD
- `/api/appointments` — appointment CRUD
- `GET /api/health` — health check

All API endpoints except authentication and health require `Authorization: Bearer <JWT>`.

## Upload to GitHub
Create an empty GitHub repository named `hospital-management-system`. Open the terminal at the project root and run:
```powershell
git init
git add .
git commit -m "Initial hospital management system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hospital-management-system.git
git push -u origin main
```
Replace the URL with your own repository URL. Do not upload database passwords, JWT secrets, or `.env` files containing secrets.

## Deployment outline
- Frontend: Vercel or Netlify; configure `VITE_API_BASE_URL` as your deployed backend URL ending in `/api`.
- Backend: Render or Railway; configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and a strong `JWT_SECRET` as environment variables.
- Database: use a hosted MySQL database accessible to the backend.
- Update CORS allowed origins in `backend/src/main/java/com/hospital/config/SecurityConfig.java` to include your deployed frontend domain.

## Important fix included
`AuthController.java` imports `org.springframework.security.core.AuthenticationException`, which resolves the missing-symbol compilation error shown in the earlier screenshot.
