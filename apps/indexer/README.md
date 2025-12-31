# Indexer - Real-Time Webhook Activity Monitor

A real-time webhook monitoring system that displays blockchain transaction events using WebSockets.

## Architecture

- **Webhook Server** (Port 3000): Express.js server with Socket.io that receives webhook POST requests and broadcasts them to connected clients
- **Frontend** (Port 3001): Next.js application that displays real-time transaction activity

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

Both the webhook server and frontend have their dependencies already installed.

### Configuration

Before running the application, configure your Alchemy API credentials:

1. Copy the `.env.local.example` file in `frontendv2/`:
   ```bash
   cd apps/indexer/frontendv2
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Alchemy credentials:
   ```
   ALCHEMY_TOKEN=your-actual-alchemy-token
   WEBHOOK_ID=wh_wjgi64e3l8sxwu9h
   ```

   - Get your `ALCHEMY_TOKEN` from the [Alchemy Dashboard](https://dashboard.alchemy.com)
   - The `WEBHOOK_ID` should match your webhook configuration

### Running the Application

You need to run both servers in separate terminal windows:

#### Terminal 1: Start the Webhook Server

```bash
cd apps/indexer/webhook
pnpm dev
```

The webhook server will start on `http://localhost:3000`

#### Terminal 2: Start the Frontend

```bash
cd apps/indexer/frontendv2
pnpm dev
```

The frontend will start on `http://localhost:3001`

### Testing the Webhook

Once both servers are running, you can test the webhook in a third terminal:

#### Option 1: Using the test script

```bash
cd apps/indexer/webhook
./test-webhook.sh
```

#### Option 2: Using curl directly

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d @frontendv2/src/app/response.example.json
```

## Features

### Webhook Server
- Receives POST requests at `/webhook`
- Broadcasts webhook data to all connected WebSocket clients
- CORS enabled for the frontend
- Connection/disconnection logging

### Frontend

#### All Activity Feed (`/`)
- Real-time activity feed showing ALL webhook events
- Connection status indicator
- Transaction details display:
  - From/To addresses with copy-to-clipboard
  - Transaction hash with Sepolia Etherscan link
  - Block number and timestamp
  - Asset type and value
- Responsive design with dark mode support
- Animations for new activities
- Displays last 50 activities (ephemeral)

#### Filtered Monitor (`/monitor`)
- **Form-based filtering** for specific wallet addresses and amounts
- **Alchemy webhook integration** - automatically adds/removes addresses from your Alchemy webhook
- Only displays transactions that match BOTH:
  - Wallet address (from OR to)
  - Exact transaction amount
- Real-time updates when matching transactions occur
- Start/Stop monitoring controls
- Error handling and loading states

## File Structure

```
apps/indexer/
├── webhook/
│   ├── server.js           # Express + Socket.io webhook server
│   ├── test-webhook.sh     # Test script
│   └── package.json
├── frontendv2/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Main page
│   │   │   ├── globals.css        # Global styles & animations
│   │   │   └── response.example.json
│   │   ├── components/
│   │   │   ├── ActivityFeed.tsx   # Main feed component
│   │   │   └── ActivityCard.tsx   # Individual activity card
│   │   └── hooks/
│   │       └── useWebSocket.ts    # WebSocket connection hook
│   └── package.json
└── README.md
```

## Development

### Webhook Server

The webhook server uses:
- Express.js for HTTP endpoints
- Socket.io for WebSocket connections
- CORS configured for `http://localhost:3001`

### Frontend

The frontend is built with:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Socket.io Client

## Data Flow

1. External service sends POST request to `http://localhost:3000/webhook`
2. Webhook server receives data and logs it
3. Server broadcasts data via Socket.io to all connected clients
4. Frontend receives data through WebSocket connection
5. UI updates in real-time showing the new activity

## Environment

- Webhook Server: Port 3000
- Frontend: Port 3001
- Network: ETH Sepolia (testnet)

## Future Enhancements

- Data persistence (database)
- Historical data viewing
- Filtering by address/asset/network
- Search functionality
- Export to CSV
- Real-time charts and analytics
- Push notifications for specific addresses
