# WebSocket Real-Time Webhook Data Implementation Plan

## Overview
Implement real-time display of webhook data in the Next.js frontend using WebSockets (Socket.io). When the Express webhook receives ADDRESS_ACTIVITY events, it will broadcast them via Socket.io to all connected frontend clients.

## Architecture

```
External Service
    ↓ (HTTP POST)
Express Webhook Server (port 3000)
    ↓ (Socket.io emit)
Next.js Frontend (port 3001)
    ↓ (Socket.io client)
Browser UI (Live Feed)
```

## Data Structure
The webhook receives Ethereum transaction events with:
- Transaction details (from/to addresses, hash, value)
- Asset information (USDC, ETH, etc.)
- Block and timestamp data
- Network information (ETH_SEPOLIA)

## Implementation Tasks

### 1. Backend: Upgrade Webhook Server
**File**: `apps/indexer/webhook/server.js`

- [ ] Install Socket.io server: `pnpm add socket.io`
- [ ] Import and initialize Socket.io with Express server
- [ ] Configure CORS for Next.js frontend (port 3001)
- [ ] Modify webhook endpoint to emit events via Socket.io
- [ ] Add connection/disconnection logging
- [ ] Broadcast webhook data to all connected clients

**Socket.io Events**:
- `connection` - Client connects
- `disconnect` - Client disconnects
- `webhook-data` - Emit webhook activity data

### 2. Frontend: Next.js WebSocket Client
**Files to Create/Modify**:
- `apps/indexer/frontendv2/src/hooks/useWebSocket.ts` - Custom React hook
- `apps/indexer/frontendv2/src/components/ActivityFeed.tsx` - Main feed component
- `apps/indexer/frontendv2/src/components/ActivityCard.tsx` - Individual event card
- `apps/indexer/frontendv2/src/app/page.tsx` - Update main page
- `apps/indexer/frontendv2/package.json` - Add socket.io-client dependency

#### 2.1 Install Dependencies
- [ ] Install socket.io-client: `pnpm add socket.io-client`

#### 2.2 Create WebSocket Hook (`useWebSocket.ts`)
- [ ] Create custom React hook to manage Socket.io connection
- [ ] Handle connection state (connected, disconnected, error)
- [ ] Listen for `webhook-data` events
- [ ] Manage activity data in state (ephemeral - in-memory only)
- [ ] Auto-reconnect on disconnect
- [ ] Clean up on unmount

#### 2.3 Create Activity Card Component (`ActivityCard.tsx`)
- [ ] Display transaction details:
  - From/To addresses (shortened with ellipsis)
  - Transaction hash (with link to Sepolia explorer)
  - Value and asset (e.g., "0.001 USDC")
  - Block number
  - Timestamp (formatted)
  - Network badge
- [ ] Use Tailwind for styling
- [ ] Add copy-to-clipboard for addresses/hash
- [ ] Color coding for different assets

#### 2.4 Create Activity Feed Component (`ActivityFeed.tsx`)
- [ ] Use the `useWebSocket` hook
- [ ] Display connection status indicator
- [ ] Show live feed of incoming webhook events
- [ ] Auto-scroll to newest (top of feed)
- [ ] Empty state when no events received
- [ ] Limit display to last 50 events (memory management)
- [ ] Add simple animations for new events

#### 2.5 Update Main Page (`page.tsx`)
- [ ] Import and render `ActivityFeed` component
- [ ] Add header/title
- [ ] Responsive layout

### 3. Configuration & Port Management
- [ ] Update webhook server to run on port 3000
- [ ] Configure Next.js dev server to run on port 3001 (via `next dev -p 3001`)
- [ ] Update package.json scripts if needed

### 4. Testing
- [ ] Test webhook server receives POST requests
- [ ] Test Socket.io emits data correctly
- [ ] Test frontend receives and displays data
- [ ] Test multiple browser windows (multiple clients)
- [ ] Test reconnection when server restarts
- [ ] Test with sample webhook data

## Technical Details

### Backend (Express + Socket.io)
```javascript
// Pseudo-code structure
import { Server } from 'socket.io';
const io = new Server(httpServer, { cors: { origin: 'http://localhost:3001' } });

io.on('connection', (socket) => {
  // Handle connections
});

app.post('/webhook', (req, res) => {
  io.emit('webhook-data', req.body);
  res.sendStatus(200);
});
```

### Frontend (React + Socket.io-client)
```typescript
// Pseudo-code structure
const socket = io('http://localhost:3000');

socket.on('webhook-data', (data) => {
  // Add to state and display
});
```

## File Structure
```
apps/indexer/
├── webhook/
│   ├── server.js (modify)
│   └── package.json (add socket.io)
└── frontendv2/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx (modify)
    │   │   └── response.example.json (reference)
    │   ├── components/
    │   │   ├── ActivityFeed.tsx (create)
    │   │   └── ActivityCard.tsx (create)
    │   └── hooks/
    │       └── useWebSocket.ts (create)
    └── package.json (add socket.io-client)
```

## Development Workflow
1. Start webhook server: `cd apps/indexer/webhook && pnpm dev`
2. Start Next.js frontend: `cd apps/indexer/frontendv2 && pnpm dev`
3. Trigger webhook via curl/Postman with sample data
4. Observe real-time updates in browser

## Future Enhancements (Out of Scope)
- Data persistence (database)
- Historical data viewing
- Filtering by address/asset/network
- Search functionality
- Export to CSV
- Real-time charts/analytics
- Notifications for specific addresses
