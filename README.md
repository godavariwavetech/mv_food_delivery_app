# Title

Food Delivery Partner App Development

## Objective

The goal of this project is to develop a mobile application for food delivery partners to manage their deliveries efficiently. The app will allow delivery partners to accept and track orders, update their availability status, navigate to restaurant and customer locations, and receive payments.

## Tech Stack

- **Frontend:** React Native (CLI)
- **Backend:** Node.js with Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **Navigation:** React Navigation
- **State Management:** Context API with AsyncStorage
- **Maps & Geolocation:** Google Maps API
- **Notifications:** Firebase Cloud Messaging (FCM) with Notifee
- **Styling:** Styled Components / Tailwind CSS

## Completion Instructions

### Functionality

#### Must Have

1. **User Authentication**
   - Login using phone number and password.
   - JWT authentication with token storage using AsyncStorage.
2. **Order Management**
   - View assigned orders.
   - Accept or reject new orders.
   - Update order status (Picked Up, Delivered, etc.).
3. **Real-time Tracking**
   - Track live location of the delivery partner.
   - Show delivery route on Google Maps.
4. **Earnings & Payments**
   - View completed deliveries and earnings breakdown.
   - Payment withdrawal request option.
5. **Notifications**
   - Real-time push notifications for new orders and status updates.
6. **Profile & Settings**
   - Update profile details (name, vehicle type, etc.).
   - Change availability status (Online/Offline).
7. **Dark Mode Support**
   - Implement theme switching based on system preference.

#### Nice to Have

- **Ratings & Reviews**
  - Allow customers to rate delivery partners.
- **In-app Chat**
  - Enable communication between customers and delivery partners.
- **SOS Button**
  - Emergency contact option for safety.

### Guidelines to Develop a Project

#### Must Have

1. **Code Structure**
   - Follow proper folder structure for maintainability.
   - Separate API service calls in a dedicated file.
2. **Performance Optimization**
   - Optimize API calls and cache frequently used data.
   - Use lazy loading for images.
3. **Error Handling**
   - Implement proper error handling and toast messages for API failures.

#### Nice to Have

- Implement offline mode to store data temporarily when internet connectivity is lost.
- Unit test key functionalities.

### Submission Instructions

#### Must Have

- Provide source code via GitHub repository.
- Include proper README documentation with setup instructions.
- Ensure all API endpoints are functional.

#### Nice to Have

- Submit a demo video showcasing app features.
- Deploy a backend API on a cloud server (e.g., AWS, DigitalOcean).

## Resources

### Design Files

- Figma design link (if available)

### APIs

- **Authentication API**
  - `POST /login`
  - `POST /register`
  - `GET /profile`
- **Orders API**
  - `GET /orders`
  - `POST /order/accept`
  - `POST /order/update-status`
- **Payments API**
  - `GET /earnings`
  - `POST /withdraw`

### Third-Party Packages

- Axios (API calls)
- React Navigation (for screen navigation)
- Google Maps API (for location tracking)
- Notifee (for push notifications)
- AsyncStorage (for local storage)

