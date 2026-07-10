# ScrapLens

ScrapLens is a real-time marketplace and coordination platform connecting household recycling users with local scrap dealers. By combining Google Gemini AI image analysis with a live scrap price web scraper, the application lets users catalog recyclable waste and coordinate collections through an interactive real-time bidding process.

**Live Demo**: [https://scrap-lens.vercel.app/](https://scrap-lens.vercel.app/)

## Key Features

### AI Scrap Identification
Upload a photo of your scrap pile. The backend utilizes Google Gemini Flash to:
* Identify material types (E-Waste, Metal, HDPE Plastic, Cardboard, Glass).
* Count items and estimate individual weights in grams.
* Allow users to manually edit or correct the AI predictions (names, categories, and weights in grams) directly inside the Scrap Bin to resolve any vision estimation inconsistencies.

### Live Market Scraping
An automated, regex-filtered scraper service fetches rates from scraprates.in to display active local market rates dynamically.

### Real-Time Bidding & Chat
* Targeted Broadcasts: When a user requests a pickup, the backend broadcasts request cards to all online dealers whose service profiles match the customer's PIN code.
* Interactive Counter-Offers: Dealers can accept the customer's price or submit counter-offers with customized scheduled ETAs.
* Instant Sync: Sockets handle accepts and declines immediately, refreshing list states across dashboards.
* Coordinated Chat: A secure websocket chat channel opens for the assigned customer-dealer pair for collection tracking.

### Environmental Impact Metrics
When a pickup is completed, the system calculates savings dynamically based on the verified weight (in kilograms) of the collected material:
* Cardboard & Paper: Saves 17 liters of water, 0.005 trees, and offsets 0.9 kg of CO2 per kg recycled.
* Metal & Iron: Saves 25 liters of water and offsets 1.5 kg of CO2 per kg recycled.
* Plastic: Saves 10 liters of water and offsets 1.2 kg of CO2 per kg recycled.
* E-Waste: Saves 15 liters of water and offsets 3.0 kg of CO2 per kg recycled.

## Project Architecture

```
ScrapLens/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection rules
│   │   ├── controllers/     # API request handlers (Users, Gigs, Scrap, Negotiations)
│   │   ├── middlewares/     # Auth (JWT) & file-upload rules
│   │   ├── models/          # Mongoose DB schemas (User, Dealer, ScrapItem, Transaction)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Sockets, Gemini AI, Scrapers, and Storage Upload services
│   │   ├── utils/           # Global error handler utilities
│   │   └── server.js        # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular layout widgets (Ledgers, Chats, Modals)
│   │   ├── context/         # Auth state providers
│   │   ├── hooks/           # Reactive page hooks (useUserDashboard, useDealerDashboard)
│   │   ├── pages/           # Base dashboard views (User, Dealer, Auth)
│   │   ├── routes/          # Router navigation controls
│   │   ├── services/        # Axios API client connection
│   │   └── styles/          # Global CSS (Imports, variables, scrollbar styles)
│   ├── vercel.json          # SPA sub-path routing rules
│   └── package.json
```

## Local Configuration

### Backend Setup
Create a `backend/.env` file with the following variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/scraplens
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL=your_imagekit_url_endpoint
```

Install dependencies and start the development server:
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Install dependencies and start the development client:
```bash
cd frontend
npm install
npm run dev
```

## Real-Time WebSocket Events

* join_chat: Room join requests for assigned dealer/customer chats.
* send_message: Sends coordinates/notes to chatrooms. Emits "new_message" to the room.
* pickup_requested: Broadcasted to local dealers on new user pickup posts.
* pickup_claimed: Emitted to notify other dealers that a request has been accepted.
* pickup_accepted: Sent to the user when a dealer accepts their offer.
* counter_offer_received: Notifies the customer of a dealer's bid change.
* counter_offer_declined: Informs the dealer that their bid was declined, opening the card back up for bidding.
* pickup_completed / pickup_cancelled: Resets lists and moves orders to the History Ledger.

## Cloud Deployment

* Frontend (Vercel): Connect repository, set root folder to `frontend`, preset to `Vite`, and configure environment variables `VITE_API_URL` and `VITE_SOCKET_URL`.
* Backend (Render): Connect repository, set root folder to `backend`, choose `Node` runtime, set build command to `npm install` and start command to `npm start`, configure environment variables, and verify that MongoDB Atlas Network Access IP Access List allows connections from anywhere (0.0.0.0/0).
