# Rydex Ride Booking System

Rydex is a secure, scalable, and role-based backend API for a modern ride-hailing service, similar to Uber or Pathao. Built with Express.js and Mongoose, it provides a complete system for riders to book rides, for drivers to manage and fulfill those rides, and for admins to oversee the entire platform's operations.

## 🔗 Live API (Vercel)

The API is deployed on Vercel. You can test the endpoints using the base URL below.

###### 🌐 API Base Url [(https://rydex-ride-booking-system-backend.vercel.app)](https://rydex-ride-booking-system-backend.vercel.app)

`Please Note:` The first API request may be slightly slower as the server function wakes up. Subsequent requests will be fast.

<br> </br>

## 🧩 Key Features

##### 👤 Core & Authentication

- `JWT-Based Authentication:` Secure login for all user roles (``admin``, ``rider``, ``driver``).
- `Role-Based Authorization:` Middleware protects routes, ensuring users can only access endpoints permitted for their role.
- `Secure Password Storage:` Passwords are never stored in plain text, using ``bcryptjs`` for strong hashing.

- `Default Verification:` Users are automatically marked as verified upon registration.

<br> </br>

##### 🚴 Rider Features

- `Request a Ride:` Riders can request a ride by providing pickup and destination coordinates.

- `Cancel a Ride:` Riders can cancel a ride request before a driver accepts it (with a daily limit on cancellations).

- `View Ride History:` Access a complete history of all past rides.


<br> </br>


##### 🚗 Driver Features

- `Driver Application:` Riders can apply to become drivers by submitting vehicle and license information.

- `Accept/Reject Rides:` View and act upon new ride requests from riders.

- `Update Ride Status:` Manage the entire ride lifecycle from ``accepted → picked_up → in_transit → completed``.

- `Set Availability:` Toggle status between Online and Offline to receive or stop receiving ride requests.

- `View Earnings History:` Track earnings from all completed rides.


<br> </br>


##### 👑 Admin Features

- `Full System Visibility:` View all ``users``, ``drivers``, ``rides``, and ``driver applications.``

- `Driver Management:` Approve or reject new driver applications.

- `User Management:` Block or unblock any user account (``rider or driver``).

- `Dashboard Analytics:` Access key statistics like total users, rides, earnings, and more.


<br> </br>

##

<br> </br>


##### 🚧 Temporarily Disabled Features
The following features exist in the codebase but are disabled in the current deployment due to the project's scope (e.g., no frontend) or hosting limitations:

- `Google Login (OAuth):` Temporarily disabled as it requires a frontend to handle the redirect flow.

- `Email OTP Verification:` Disabled due to Vercel's limitations with Nodemailer (SMTP).

- `Forgot/Reset Password Flow:` Also disabled due to the email service limitation.


## ⚙️ Technologies Used

    - Node.js	                        JavaScript runtime environment.
    - Express.JS                            Fast, unopinionated, minimalist web framework for Node.js.
    - TypeScript                            Statically typed superset of JavaScript for robust code.
    - Mongodb                               NoSQL database for storing user, ride, and driver data.
    - Mongoose                              Elegant MongoDB object modeling for Node.js.
    - JWT (JSON Web Token)                  For creating secure access tokens for authentication.
    - Bcrypt.js	                        A library to help you hash passwords.
    - Zod	                                TypeScript-first schema declaration and validation library.
    - Day.js	                        For handling dates and times efficiently.
    - Vercel                                for deployment
    - Postman                               for api testing

<br> </br>

## 🗂️ Project Structure
The project follows a modular architecture to keep the codebase clean, scalable, and easy to maintain.

```
🗂️ src/
├── app.ts                      # Creates and configures the Express application
├── server.ts                   # Connects to the database and starts the server
│
├── app/
│   ├── modules/
│   │   ├── auth/               # Handles authentication logic
│   │   ├── user/               # Handles user management logic
│   │   ├── driver/             # Handles driver-specific logic
│   │   ├── ride/               # Handles ride management logic
│   │   └── analytics/          # Handles data analytics for admins
│   │
│   ├── middlewares/            # Contains global middlewares
│   ├── utils/                  # Contains shared utility functions
│   └── config/                 # Contains environment variables and config
│
├── errorHelpers/               # Contains the custom AppError class
│   └── AppError.ts
│
├── helpers/                    # Contains specific error handling functions
│   ├── handleCastError.ts
│   ├── handleDuplicateError.ts
│   ├── handleValidationError.ts
│   └── handleZodError.ts
│
└── ...                           # Other directories as needed

```

<br> </br>



## 🔑 API Endpoints Summary
⚠️ Important Note for Testers: Due to the reasons mentioned in the `"Temporarily Disabled Features"` section, please skip testing any routes related to `Google Login`, `OTP`, `Set Password`, or `password resets`.


Authentication `(/api/v1/auth)`


    Endpoint	        Method	            Description	Required                                            Role(s)
    /login	                POST	            Log in a user with email and password.	                    Public
    /refresh-token	        POST	            Generate a new access token using a refresh token.	            Public
    /change-password        POST	            Change the password for a logged-in user.	                    admin, rider, driver


<br> </br>

User `(/api/v1/user)`


    Endpoint	        Method	            Description	Required                                            Role(s)
    /register	        POST	            Register a new user (defaults to rider role & verified).	    Public
    /me	                GET	            Get the profile of the currently logged-in user.	            admin, rider, driver
    /all-users              GET	            Get a list of all users.	                                    admin
    /:userId                GET	            Get a single user's details by ID.	                            admin
    /:userId                PATCH	            Update user information.	                                    admin, rider, driver
    /:userId                DELETE	            Delete a  user.	                                            admin




<br> </br>

Ride `(/api/v1/rides)`


    Endpoint	        Method	            Description	Required                                            Role(s)
    /	                POST	            Request a new ride.	                                            rider
    /	                GET	            View all rides in the system	                            admin
    /history                GET	            View personal ride history.	                                    rider
    /earnings               GET	            View personal earnings history.	                            driver
    /:rideId/cancel         PATCH	            Cancel a requested ride.	                                    rider
    /:rideId/rideStatus     PATCH	            Update the status of a ride.	                            driver





<br> </br>

Driver `(/api/v1/drivers)`


    Endpoint	                        Method	            Description	Required                                            Role(s)
    /apply-driver	                        POST	            Submit an application to become a driver.	                    rider
    /driver-application	                GET	            View all pending driver applications.	                    admin
    /driver	                                GET	            View all approved drivers.  	                            admin
    /history                                GET	            View personal ride history.	                                    rider
    /driver-application/:appId/status       PATCH	            Approve or reject a driver application.	                    admin     
    /:driverId/availability                 PATCH	            Update driver's availability (Online/Offline).	            driver







<br> </br>

Analytics `(/api/v1/analytics)`


    Endpoint	                        Method	            Description	Required                                            Role(s)
    /stats                                  GET	            Get dashboard statistics for the admin panel.	            admin





<br> </br>

## ⚙️ Setup and Installation
Follow these steps to set up the project on your local machine.



#### ✅ Prerequisites

    - Node.js >= 18
    - npm or yarn
    - MongoDB Atlas or Local MongoDB Instance

<br> </br>

## 📦 Installation

###### 1. Clone the repository: 
```
 git clone https://github.com/codewithsaidul/ride-booking-system-assignment-five

 cd ride-booking-system-assignment-five/server

```
###### 2. Install dependencies:

```
 npm install
```


<br> </br>

###### 3. Set up environment variables:

Create a `.env` file in the root directory. For your convenience, an example file (`env.example`) is provided. You can simply copy this file and rename it to `.env`, then update the values with your actual configuration.



.env.example


```

PORT =3000
DB_URL =mongodb://localhost:27017/your_db_name
NODE_ENV =development
BCRYPT_SALT_ROUND =10

# Express Session Secret
EXPRESS_SESSION_SECRET=your_session_secret_here



JWT_ACCESS_SECRET =your_jwt_access_secret_here
JWT_ACCESS_EXPIRATION_TIME =1d
JWT_REFRESH_SECRET =your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRATION_TIME =30d


ADMIN_EMAIL =your_admin_email_here
ADMIN_PASSWORD =your_admin_password_here


GOOGLE_CLIENT_ID =your_google_client_id_here
GOOGLE_CLIENT_SECRET =your_google_client_secret_here
GOOGLE_CALLBACK_URL =your_google_callback_url_here


FRONTEND_URL =your_frontend_url_here




# SMTP GMAIL
# SMTP Configuration (for sending emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-smtp-username@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM="Your App Name <no-reply@example.com>"




# REDIS SETUP
# REDIS Configuration (for storing otp)
REDIS_HOST =your_redist_host
REDIS_PORT =your_redis_port
REDIS_USERNAME =your_redis_username
REDIS_PASSWORD =your_redis_password



```

<br> </br>

###### 4. Run the application in development mode:
This will start the server with ts-node-dev, which automatically restarts on file changes.



```
npm run dev
```


###### 5. Build for production:


```
npm run build
```


###### 6. Start the production server:


```
npm run start 

```


The server will be running on `http://localhost:3000`. You can now use an API client like Postman to test the endpoints.

<br> </br>



## 🧑‍💻 Author

##### SAIDUL ISLAM RANA

Frontend Dev | Backend Learner | MERN Stack Enthusiast
<br>
GitHub: @codewithsaidul
