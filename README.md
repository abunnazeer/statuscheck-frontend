# StatusCheck Frontend

Modern, secure NIN/BVN verification platform built with Next.js 15, TypeScript, and CSS Modules.

## Features

- 🔐 Secure authentication with JWT
- 💳 Wallet management with Monnify integration
- ✅ Multiple verification types (NIN, BVN, Demographic)
- 📊 Real-time dashboard with statistics
- 📱 Fully responsive design
- 🎨 Modern UI with CSS Modules
- 🌙 Dark mode support (coming soon)
- 📄 PDF report generation
- 🔔 Toast notifications
- ♿ Accessible components

## Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd statuscheck_frontend
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Create environment file
```bash
cp .env.example .env.local
```

4. Update environment variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Run development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── common/            # Shared components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── lib/
│   ├── api/               # API client & services
│   └── utils/             # Utility functions
├── stores/                # Zustand stores
├── styles/                # Global styles
│   └── components/        # Component styles
├── types/                 # TypeScript types
└── hooks/                 # Custom hooks
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `StatusCheck` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

## Key Features Implementation

### Authentication
- JWT-based authentication
- Persistent login with Zustand
- Protected routes
- Auto-redirect on unauthorized

### Wallet System
- Real-time balance updates
- Transaction history
- Fund wallet via Monnify
- Payment verification

### Verification Services
- NIN verification
- BVN verification
- Demographic verification
- PDF report generation

### UI Components
- Button, Input, Select, Textarea
- Card, Badge, Modal, Toast
- Table, Pagination
- Avatar, Spinner, Empty State
- Stat Cards

## Styling Approach

This project uses **CSS Modules** for component styling:
- Scoped styles per component
- CSS custom properties for theming
- Responsive design with media queries
- Dark mode ready

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - All rights reserved

## Support

For support, email support@statuscheck.ng