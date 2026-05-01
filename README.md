Affordable Housing Rental Platform

A full‑stack web application for listing, searching, and managing affordable housing rentals — built with a React frontend and a Node.js/Express backend.

This platform helps renters discover available homes and landlords manage their listings easily and efficiently.

 Features General

User authentication (sign up / login)

Role‑based access (tenant, landlord/admin)

Create, read, update, delete (CRUD) property listings

Search & filter housing listings

Responsive UI built with modern frontend technologies

Frontend (Client)

Built with React

User‑friendly listing pages

Forms for posting and updating properties

Real‑time validation and notifications

Backend (Server)

Node.js + Express.js REST API

Database integration ( MongoDB )

Authentication using JWT

Secure route handling and request validation
 
 Tech Stack
Layer	Technology
Frontend	React, Tailwind CSS / Styled Components
Backend	Node.js, Express
Database	MongoDB 
Authentication	JWT / Session‑based
Deployment	Vercel (frontend), Render  (backend)

Clone the Repo
git clone https://github.com/helenlemessa/Affordable-Housing-Rental-Platform.git
cd Affordable-Housing-Rental-Platform

 Backend Setup
cd server
npm install
Start the server:
npm run dev

Frontend Setup
cd client
npm install


Create a .env file (example):

REACT_APP_API_URL=http://localhost:5000/api


Start the frontend:

npm start

 Folder Structure
Affordable-Housing-Rental-Platform/
├── client/                 # React frontend
├── server/                 # Express backend
├── .gitignore
├── package.json            # Root package file  
├── README.md

 Environment Variables
Name	Description
DB_URI	Database connection string
JWT_SECRET	Secret key for signing JWT
PORT	Server port (default: 5000)
REACT_APP_API_URL	URL to backend API
  API Endpoints (example)
Method	Endpoint	Description
GET	/api/listings	Get all listings
GET	/api/listings/:id	Get a single listing
POST	/api/listings	Create a new listing
PUT	/api/listings/:id	Update a listing
DELETE	/api/listings/:id	Delete a listing
POST	/api/auth/login	User login
POST	/api/auth/register	User sign up
  Contributing

Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch: git checkout -b feature/YourFeature

Commit your changes: git commit -m "Add some feature"

Push to your branch: git push origin feature/YourFeature

Submit a pull request
  License

This project is open‑source and available under the MIT License.

  Acknowledgements

Thanks to open‑source contributors and the developer community for inspiration and support.
