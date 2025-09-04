# WTF Bank - Digital Banking Application

A modern, professional digital banking web application for WTF Bank (Where's The Funds?) built with React, TypeScript, and Tailwind CSS.

## 🏛️ Features

### Customer Portal
- **Secure Authentication**: JWT-based login and registration with OTP verification
- **Dashboard Overview**: Account summaries, recent transactions, and quick actions
- **Account Management**: View account details, balances, and create new accounts
- **Transaction History**: Detailed transaction logs with filtering and search
- **KYC Management**: Document upload and verification status tracking
- **Support System**: Ticket creation and management
- **Profile Management**: Update personal information and settings

### Admin Portal
- **Admin Dashboard**: System overview and analytics
- **KYC Management**: Review and approve customer documents
- **Support Management**: Handle customer support tickets
- **Customer Management**: View and manage customer accounts
- **Analytics**: System metrics and reporting

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Shadcn/ui component library
- **Animations**: Framer Motion (motion/react)
- **State Management**: React hooks with local state
- **API Integration**: RESTful API with JWT authentication
- **Development**: Mock API service for offline development

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Development Mode

The application includes a sophisticated development system:

- **Mock Mode**: Automatically enabled when backend is unavailable
- **Real API Mode**: Connects to your PQR Banking System API when available
- **Auto-fallback**: Seamlessly switches between real and mock data

### Demo Credentials

#### Customer Login
- Email: `demo@wtfbank.com`
- Password: `demo123`

#### Admin Login
- Username: `admin001`
- Password: `admin123`

## 🏗️ Architecture

### Project Structure
```
/
├── components/
│   ├── auth/           # Authentication components
│   ├── customer/       # Customer portal components
│   ├── admin/          # Admin portal components
│   └── ui/             # Reusable UI components
├── services/
│   ├── api.ts          # Main API service
│   ├── enhanced-api.ts # Enhanced API with fallback
│   ├── mock-api.ts     # Mock API implementation
│   └── dev-config.ts   # Development configuration
├── utils/
│   └── environment.ts  # Browser-safe environment utilities
└── styles/
    └── globals.css     # Global styles and design tokens
```

### API Service Layer

The application uses a three-tier API architecture:

1. **Main API Service** (`api.ts`): Direct integration with your backend
2. **Enhanced API Service** (`enhanced-api.ts`): Smart fallback system
3. **Mock API Service** (`mock-api.ts`): Development mock data

### Design System

Built with a professional fintech design system:

- **Colors**: Deep navy primary, white background, gold accents
- **Typography**: Consistent sizing and weights
- **Components**: Fully accessible with consistent styling
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:8080  # Your backend URL
NODE_ENV=development                      # Environment mode
```

**Note**: The application includes browser-safe environment variable handling that gracefully handles cases where `process.env` is not available. The default API URL is `http://localhost:8080` if no environment variable is set.

### API Integration

To integrate with your PQR Banking System:

1. Update the API base URL in `services/api.ts`
2. Disable mock mode in `services/dev-config.ts`:
   ```typescript
   ENABLE_MOCK_MODE: false
   ```
3. Ensure your backend is running on the configured port

### Mock Mode Control

The mock mode can be controlled via:
- `DEV_CONFIG.ENABLE_MOCK_MODE` in `dev-config.ts`
- Runtime toggle in development mode
- Automatic fallback when backend is unavailable

## 🎨 Customization

### Design Tokens
Update design tokens in `styles/globals.css`:
```css
:root {
  --primary: #1a1d29;      /* Deep navy */
  --accent: #d4af37;       /* Gold accent */
  --background: #ffffff;    /* White background */
  /* ... other tokens */
}
```

### Component Styling
- All components use Tailwind CSS classes
- Custom variants defined in global CSS
- Consistent spacing and typography system

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebar on smaller screens
- Optimized touch targets
- Accessible navigation

## 🔐 Security Features

- JWT token management with automatic refresh
- Secure authentication flows
- Protected routes based on user roles
- Session restoration on page reload
- Automatic logout on token expiry

## 🧪 Development Features

- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **Component Library**: Reusable UI components with proper ref forwarding
- **Mock Data**: Realistic development data
- **Error Handling**: Comprehensive error boundaries
- **DOM Validation**: Proper HTML structure to avoid nesting warnings
- **Environment Safety**: Browser-safe environment variable handling

## 📝 API Endpoints

The application expects these backend endpoints:

### Authentication
- `POST /auth/login` - Customer login
- `POST /auth/register/initiate` - Start registration
- `POST /auth/register/verify-email` - Verify email OTP
- `POST /auth/register/complete` - Complete registration
- `POST /admin/auth/login` - Admin login

### Customer Endpoints
- `GET /api/customers/me` - Get current customer
- `GET /api/accounts` - Get user accounts
- `POST /api/accounts/create` - Create new account
- `GET /api/transactions/account/:id` - Get transaction history

### Admin Endpoints
- `GET /admin/customers` - List all customers
- `GET /admin/kyc/pending` - Pending KYC requests
- `GET /admin/support/tickets` - Support tickets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔧 Troubleshooting

### Common Issues

**Build Errors with Environment Variables**
- Error: `process is not defined`
- Solution: The app includes browser-safe environment utilities in `utils/environment.ts`

**DOM Nesting Warnings**
- Error: `<div> cannot appear as a descendant of <p>`
- Solution: Use `<div>` tags instead of `<p>` when content might contain Skeleton components

**Component Ref Warnings**
- Error: `Function components cannot be given refs`
- Solution: All UI components use `React.forwardRef` for proper ref handling

**API Connection Issues**
- Issue: Cannot connect to backend
- Solution: The app automatically falls back to mock mode when backend is unavailable

### Development Mode

When running in development mode, you'll see a status indicator in the bottom-right corner showing:
- Current API mode (Mock/Real)
- Backend connection status
- Authentication state

## 📄 License

This project is proprietary software for WTF Bank.

---

**Ready to build the future of banking!** 🚀

For support or questions, contact the development team.