# Node.js Authentication API

A robust Node.js and Express.js backend offering a complete authentication solution with MongoDB. Features include secure user registration, JWT-based login, OTP email verification for enhanced security, and advanced session management enabling users to seamlessly log out from all active devices at once.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JSON Web Tokens (JWT)
- **Emails:** Nodemailer (for OTP verification)
- **Other:** bcrypt (implied for password hashing), crypto

## Features
- User Registration & Login
- Access & Refresh Token generation
- Secure Session Management
- Logout from current device or all devices simultaneously
- Email Verification using OTP (One-Time Password)

## Folder Structure

```text
d:\CODE\Backend_Project\AUTH
├── package.json
├── server.js
└── src/
    ├── app.js
    ├── config/
    │   ├── config.js
    │   └── database.js
    ├── controllers/
    │   └── auth.controller.js
    ├── models/
    │   ├── otp.model.js
    │   ├── session.model.js
    │   └── user.models.js
    ├── routes/
    │   └── auth.routes.js
    ├── services/
    │   └── email.service.js
    └── utils/
        └── utils.js
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint          | Description                                | Access  |
| ------ | ----------------- | ------------------------------------------ | ------- |
| POST   | `/register`       | Register a new user                        | Public  |
| POST   | `/login`          | Authenticate and log in user               | Public  |
| GET    | `/get-me`         | Get current logged-in user details         | Private |
| GET    | `/refresh-token`  | Refresh the access token                   | Private |
| POST   | `/logout`         | Log out user from current session/device   | Private |
| POST   | `/logout-all`     | Log out user from all active devices       | Private |
| POST   | `/verify-email`   | Verify user email address via OTP          | Private |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- MongoDB database set up

### Installation

1. Clone the repository and navigate to the project folder.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The server will be running on port 3000 by default.
