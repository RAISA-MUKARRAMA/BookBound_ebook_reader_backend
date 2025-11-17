BookBound Backend — Practice Project

This is the backend server for the BookBound eBook Reader project.
It provides APIs for authentication, book purchases, purchase history, user data, and integrations with the demo bank payment service.

This backend uses Node.js, Express, MongoDB (Mongoose).

🚀 Prerequisites

Before running this backend, you must set up:

1️⃣ Frontend (Next.js App)

Clone and run the frontend first:
🔗 https://github.com/RAISA-MUKARRAMA/BookBound_ebook_reader

2️⃣ Demo Bank Server

Required for handling payments:
🔗 https://github.com/RAISA-MUKARRAMA/Demo_Bank_for_BookBound

Make sure both frontend and bank server are running before starting this backend.

📥 Clone the Backend
git clone https://github.com/RAISA-MUKARRAMA/BookBound_backend.git
cd BookBound_backend

⚙️ Environment Variables

Create a file named .env in the project root and paste the following:

MONGO_URL=mongodb+srv://raisa123:raisa123@raisa123.fiegexc.mongodb.net/?appName=raisa123
DB_NAME=db1
PORT=5002
PUBLIC_BANK_SERVER_URL=http://localhost:6002
BOOKBOUND_ACCOUNT_NO=123456789
BOOKBOUND_FRONTEND_URL=http://localhost:3002


✔️ No need to set up your own database — this project uses a public demo database.

📦 Install Dependencies

Run:

npm install

▶️ Start the Backend Server
Development Mode (recommended)
npm run dev

Production Mode
npm start


The backend will run at:

http://localhost:5002

📁 Project Structure
/model        → Mongoose schemas  
/routes       → All backend API routes  
/middleware   → Auth middleware  
server.js     → App entry point  
.env          → Environment config (you create this)

🔌 APIs Provided

Authentication

Book retrieval & listing

Purchase creation (single/multiple books)

Purchase completion

Purchase history

Purchased books listing

Cart → auto-remove purchased items

✔️ Everything Ready!

Once backend, frontend, and bank server are running, the full system works end-to-end:

User signup & login

Browse books

Add to cart & purchase

Payment processing through the demo bank

Auto-save purchased books

Purchase history displayed

Purchased books available in user profile

❓ Need Help?

If you face any issue running the backend, feel free to contact me through the repository issues page.