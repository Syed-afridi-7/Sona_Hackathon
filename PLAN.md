🪐 1. System Architecture Overview
                        [ Client / Frontend ]
                     (Next.js + TanStack Router)
                                  │
                       HTTPS / WSS (WebSockets)
                                  │
                                  ▼
                        [ Backend API Gateway ]
                     (Node.js + Express + TypeScript)
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  [ Primary DB ]           [ Cache & Chat ]         [ Object Storage ]
 (PostgreSQL / Prisma)      (Redis Server)       (Firebase / Cloudinary)

🎨 2. Frontend Architecture (Next.js & TanStack Router)
UI Directory Structure

src/
├── components/
│   ├── ui/                 # Shadcn/ui baseline tokens
│   ├── shared/             # Navbar, Sidebar, BottomNav, PostCard
│   ├── dashboard/          # Analytics charts, metrics grids
│   └── pitch-reels/        # Vertical video swiper components
├── routes/                 # TanStack Router folder-based routing
│   ├── __root.tsx          # Main layout with context wrappers
│   ├── index.tsx           # Splash / Entry point
│   ├── auth/               # Login & Signup routes
│   ├── home.tsx            # Aggregated Feed & Star Business
│   ├── reels.tsx           # PitchReels layout
│   ├── profile/            # Dynamic $profileId display
│   └── dashboard/          # Protected business/investor panels
└── store/                  # Zustand global application state

Route Design & State Strategy
Routing System: Utilizing TanStack Router for typesafe search parameters (ideal for the heavy multi-tier filtering in the Discover screen) and explicit route-level authentication guards.

Global State (Zustand): Used for lightweight, non-persistent state management including global active user identity wrappers, active UI modal targets (e.g., meeting scheduler trigger), and real-time counter updates.

⚡ 3. Backend Engine (Node.js & Express)
Core Modules
Authentication Service: JWT verification paired with HTTP-only security cookies.

Media Middleware: Intercepts incoming multi-part form requests (via Multer), piping videos/documents directly into external media Buckets.

Real-time Synchronization Engine: Dual-purpose Socket.io pipeline handling persistent messaging state and push alerts (e.g., Profile Views, Verification Approvals).

Essential API Routes
POST   /api/v1/auth/register      -> Instantiate user credentials
POST   /api/v1/profiles/create    -> Construct Profile (Business vs Investor schemas)
GET    /api/v1/discover           -> Complex filter querying (Industry, Valuation)
POST   /api/v1/reels/upload       -> Store PitchReel and index video metadata
POST   /api/v1/meetings/schedule  -> Log a new calendar appointment link


💾 4. Database Schema (Relational PostgreSQL)
-- Enums for Role and Verification
CREATE TYPE user_role AS ENUM ('BUSINESS', 'INVESTOR', 'ADMIN');
CREATE TYPE verify_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- Base User Identity Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table mapping User Roles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    description TEXT,
    location VARCHAR(150),
    avatar_url TEXT,
    
    -- Shark Tank / Investment Specific Fields
    funding_required NUMERIC(15, 2) DEFAULT 0.00,
    equity_offered NUMERIC(5, 2) DEFAULT 0.00,
    revenue NUMERIC(15, 2) DEFAULT 0.00,
    profit NUMERIC(15, 2) DEFAULT 0.00,
    growth_rate NUMERIC(5, 2) DEFAULT 0.00,
    
    -- Verification Badge State
    verification_status verify_status DEFAULT 'PENDING',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PitchReels Index Table
CREATE TABLE pitch_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    caption TEXT,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting Appointments Table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id),
    receiver_id UUID REFERENCES profiles(id),
    scheduled_time TIMESTAMP NOT NULL,
    is_online BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'PENDING'
);

🚀 5. Implementation Roadmap for the Hackathon
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│        PHASE 1          │     │        PHASE 2          │     │        PHASE 3          │
│   Database & Auth Setup │ ──> │   Core Swiper & Feed    │ ──> │ Real-Time Engine & Data │
│                         │     │                         │     │                         │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘

Phase 1: Foundations 
Spin up local Docker instances for PostgreSQL.

Scaffold out your Express boilerplate with strict TypeScript rules.

Generate the global base layouts in the UI using TanStack Router hooks.

Phase 2: Feature Development 
Build out the mobile responsive PitchReels view using standard HTML5 video elements wrapped inside a responsive container, fetching data natively from the API.

Integrate highly visible visual analytics charts directly onto dashboards using recharts to render growth targets cleanly.

Phase 3: Polish & Deployment 
Inject full WebSocket connectivity into your secure chat views to enable instant messaging capabilities.

Finalize verification badges and deploy onto a fast infrastructure platform (like Vercel and Render) for live staging before your pitch presentation.
