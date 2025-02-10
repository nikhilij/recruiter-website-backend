# 🚀 Recruiter Website Backend  

## 🏗️ Project Overview  
The **Recruiter Website Backend** is a powerful and scalable Node.js backend designed to bridge the gap between recruiters and job seekers. It provides real-time job notifications, smart job recommendations, resume processing, and an intuitive admin panel, ensuring a seamless hiring experience.  

With a focus on **performance, security, and scalability**, this backend is built using modern technologies like **Node.js, Express, MongoDB, Redis, WebSockets, and Firebase Cloud Messaging (FCM)**.  

## ✨ Features  
✅ **Real-Time Push Notifications**  
- WebSockets (Socket.io) for instant job alerts and application updates.  
- Firebase Cloud Messaging (FCM) for mobile notifications.  
- Persistent storage of notifications in MongoDB.  

✅ **Email Automation**  
- Automated transactional emails (job application confirmation, alerts) using Nodemailer.  
- Scheduled email digests with cron jobs (node-cron, Agenda).  

✅ **Smart Job Matching**  
- AI-powered job recommendations based on user skills.  
- Matching algorithm using **TF-IDF or embeddings** for accurate suggestions.  

✅ **Resume Handling**  
- File upload support with **multer**.  
- PDF-to-text conversion using **pdf-parse** or **Tesseract OCR** for extracting resume data.  
- Efficient storage by saving only extracted text.  

✅ **Admin Panel**  
- Manage **job listings, users, and analytics** through a web dashboard.  
- Role-based access control for recruiters and admins.  

✅ **Security Enhancements**  
- **Rate limiting** (express-rate-limit) to prevent abuse.  
- **Helmet middleware** for enhanced security headers.  
- **JWT refresh tokens** for secure authentication management.  

✅ **Performance & Scalability**  
- **Redis caching** for frequently accessed data like job listings.  
- **Bull (Redis-backed queue)** for handling background jobs efficiently.  

## 🏗️ Tech Stack  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Redis  
- **Notifications:** WebSockets (Socket.io), Firebase Cloud Messaging (FCM)  
- **Email Services:** Nodemailer, Cron Jobs  
- **File Handling:** Multer, PDF-Parse, Tesseract OCR  
- **Authentication:** JWT, Refresh Tokens  
- **Task Queue:** Bull (Redis-backed queue)  

## 🔥 Getting Started  
### 1️⃣ Clone the Repository  
```bash  
git clone https://github.com/nikhilij/recruiter-website-backend.git  
cd recruiter-website-backend  
```

### 2️⃣ Install Dependencies  
```bash  
npm install  
```

### 3️⃣ Configure Environment Variables  
Create a `.env` file and add the required configurations:  
```ini  
PORT=5000  
MONGO_URI=your_mongodb_connection_string  
REDIS_URL=your_redis_connection_string  
JWT_SECRET=your_jwt_secret  
FCM_SERVER_KEY=your_firebase_server_key  
EMAIL_USER=your_email@example.com  
EMAIL_PASS=your_email_password  
```

### 4️⃣ Run the Application  
```bash  
npm start  
```
or for development:  
```bash  
npm run dev  
```

### 5️⃣ API Documentation  
The API endpoints are documented using **Swagger** or **Postman Collection**.  

## 🚀 Future Enhancements  
- AI-based **resume screening** and **candidate ranking**.  
- **Multi-language support** for wider accessibility.  
- Integration with **third-party job portals** for a wider reach.  

## 📜 License  
This project is licensed under the **MIT License**.  

## ❤️ Contributing  
We welcome contributions! Feel free to submit a pull request or open an issue.  

