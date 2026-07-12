# 🌐 Connexion: Production Scaling Blueprint

This document details the systems architecture and database optimization strategies required to transition **Connexion** from a prototype to a highly concurrent production platform.

---

## 💾 1. Database Optimization Layer

To handle thousands of active users searching, matching, and query-filtering startup portfolios simultaneously, we must optimize the database layer.

### 🔀 Read/Write Replica Clustering
We decouple heavy analytical searches from critical database writes (like processing user authentication and schedule updates) by introducing a replica pool:

```
                  [ API Gateway / Backend Node ]
                     /                      \
      (Write Requests)                      (Read Requests)
                   /                          \
                  v                            v
          [(Primary DB) ] --------------> [ (Read Replica Pool) ]
          Postgres Master   (Replication)   Postgres Replicas (x3)
```

1. **Transactional Writes:** Auth registration, profile updates, and calendar bookings target the **Primary DB** instance.
2. **Heavy Searches & Analytics:** Search queries, category discover grids, and metric analytics queries are directed to the **Read Replica Pool** using a round-robin load balancer.

### ⚡ Critical Schema Performance Indexes
To ensure sub-millisecond search latencies on the **Discover** filters, we establish target composite and partial indexes in PostgreSQL:

```sql
-- 1. Index for Discover Screen (Multi-variable filter combining Industry and Funding Required)
CREATE INDEX idx_profiles_industry_funding 
ON business_details (industry, funding_required DESC);

-- 2. Index for Location-based local investor queries
CREATE INDEX idx_profiles_location 
ON profiles (location) 
WHERE role = 'BUSINESS';

-- 3. Composite Index for Real-Time Chat message retrieval (Sender/Receiver sorting)
CREATE INDEX idx_chat_messages_conversation 
ON chat_messages (sender_id, receiver_id, created_at DESC);

-- 4. Index on Meeting Scheduler search parameters
CREATE INDEX idx_meetings_schedule 
ON meetings (scheduled_time, status) 
WHERE status = 'PENDING';
```

---

## 🎥 2. Media Pipeline Scaling for PitchReels

Streaming raw `.mp4` video files directly from standard web servers causes high bandwidth costs and client-side playback lag. We decouple the media pipeline:

```
[ Client App ] ---> (1. Fetch Pre-signed URL) ---> [ API Gateway ]
     |
     +------------> (2. Direct Upload) -----------> [ Raw Video S3 Bucket ]
                                                          |
                                                  (S3 ObjectCreated Event)
                                                          |
                                                          v
                                                  [ AWS Lambda / FFmpeg ]
                                                          |
                                                  (Convert to HLS/ABR)
                                                          |
                                                          v
[ Client App ] <--- (3. Low Latency Stream) <--- [ CDN (CloudFront) ]
```

### ⚙️ Step-by-Step Serverless HLS Pipeline
1. **Direct S3 Uploads:** The client requests a secure pre-signed upload URL from our API, bypassing our server and uploading directly to `s3://connexion-raw-reels/`.
2. **Serverless Transcoding Trigger:** An S3 event trigger fires an AWS Lambda function running an optimized `FFmpeg` binary.
3. **Adaptive Bitrate Streaming (ABR):** The Lambda function converts the raw video into HLS formats (creating standard `360p`, `720p`, and `1080p` streams along with a `.m3u8` master playlist).
4. **Edge Delivery via CDN:** The compiled HLS chunks are stored in `s3://connexion-public-streams/` and served globally via Amazon CloudFront with low latency.

---

## ⚡ 3. Distributed State & Message Caching

To scale our WebSocket chat and notifications service horizontally across multiple servers, we implement Redis Pub/Sub as the state backplane.

```
[ Client A ] ----> [ Server Node 1 ]       [ Server Node 2 ] <---- [ Client B ]
                         \                       /
                      (Publish)              (Subscribe)
                          \                     /
                           v                   v
                        [  Redis Pub/Sub Channel  ]
```

### 🛠️ Horizontal WebSocket Integration (Node.js + Redis)
When running multiple API gateways behind a load balancer, client connections are scattered across different servers. We synchronize messages in real-time:

```typescript
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

// Establish Pub/Sub connections to Redis cluster
const pubClient = createClient({ url: 'redis://default:auth_password@redis-cluster:6379' })
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  // Bind Socket.io adapter to Redis pub/sub
  io.adapter(createAdapter(pubClient, subClient))
  console.log('Horizontal scaling active via Redis Pub/Sub Adapter.')
})

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId)
  })

  socket.on('send_message', (data) => {
    // Redis adapter automatically broadcasts this message to the correct room
    // even if the recipient is connected to a different server node!
    io.to(data.roomId).emit('receive_message', data)
  })
})

httpServer.listen(3001)
```
