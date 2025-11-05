# Pharmastackx - Health-Tech Marketplace

> A modern health-tech marketplace for medications and pharmaceuticals connecting customers with verified pharmacies for safe medication delivery.

## 🏥 Features

### For Customers
- **Location-Based Search**: Find medications from the nearest pharmacies
- **Smart Filtering**: Filter by category, price, prescription requirements
- **Secure Ordering**: Safe and secure medication ordering system  
- **Real-Time Tracking**: Track orders and delivery status
- **Responsive Design**: Works seamlessly on mobile and desktop

### For Businesses (Pharmacies)
- **Product Management**: Easy inventory management dashboard
- **Bulk Upload**: Upload products individually or via CSV files
- **Smart Parsing**: Intelligent CSV parsing with validation
- **Analytics Dashboard**: Track sales, orders, and performance
- **Verification System**: Secure business verification process

## 🎨 Design System

- **Primary Color**: Dark Green (#1B5E20)
- **Secondary Color**: Magenta (#E91E63)
- **UI Framework**: Material-UI (MUI) v7
- **Typography**: Inter font family
- **Theme**: Modern health-tech aesthetic with clean lines

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- VS Code (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmastackx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
pharmastackx/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── medications/   # Medication APIs
│   │   ├── business/          # Business portal pages
│   │   │   └── dashboard/     # Business dashboard
│   │   ├── medications/       # Customer medication browse
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── theme/                 # Material-UI theme configuration
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── .next/                     # Next.js build output
└── package.json               # Dependencies and scripts
```

## 🛠 Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Component library
- **Emotion**: CSS-in-JS styling

### Backend & APIs
- **Next.js API Routes**: Serverless API endpoints
- **CSV Processing**: File upload and parsing
- **Type Safety**: Full TypeScript coverage

### Development Tools
- **ESLint**: Code linting
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **VS Code**: Recommended IDE

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🏗 Key Components

### Homepage (`src/app/page.tsx`)
- Hero section with gradient text
- Feature showcase cards
- Statistics display
- Call-to-action sections

### Business Dashboard (`src/app/business/dashboard/page.tsx`)
- Multi-tab interface (Dashboard, Inventory, Upload, Analytics)
- Product management table
- CSV upload with drag-and-drop
- Analytics cards and metrics

### Medications Browse (`src/app/medications/page.tsx`)
- Advanced search and filtering
- Location-based sorting
- Shopping cart functionality
- Product cards with pharmacy info

### API Routes
- `GET /api/medications` - Search medications
- `POST /api/medications` - Create medication
- `POST /api/medications/upload` - Bulk CSV upload
- `GET /api/medications/upload` - Download CSV template

## 🎯 Core Features Implementation

### CSV Upload System
- **File Validation**: Supports CSV, XLS, XLSX (max 10MB)
- **Smart Parsing**: Automatic field mapping and validation
- **Error Handling**: Row-by-row error reporting
- **Batch Processing**: Up to 1000 products per upload

### Material-UI Theme
- **Custom Colors**: Healthcare-focused color palette
- **Component Overrides**: Consistent styling across components
- **Responsive Design**: Mobile-first approach
- **Typography Scale**: Hierarchy for readability

### Location Services
- **Distance Calculation**: Pharmacy proximity sorting
- **Delivery Estimation**: Real-time delivery time estimates
- **Zone Management**: Configurable delivery zones

## 🔧 Configuration Files

### `tailwind.config.ts`
```typescript
// Custom color palette matching MUI theme
colors: {
  primary: { DEFAULT: '#1B5E20' },
  secondary: { DEFAULT: '#E91E63' }
}
```

### `src/theme/theme.ts`
```typescript
// Material-UI theme with custom colors
palette: {
  primary: { main: '#1B5E20' },
  secondary: { main: '#E91E63' }
}
```

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Enhanced layout for tablets  
- **Desktop Experience**: Full-featured desktop interface
- **Grid System**: CSS Grid and Flexbox layouts

## 🔐 Security Features

- **Input Validation**: Comprehensive data validation
- **File Type Checking**: Secure file upload restrictions
- **Error Handling**: Graceful error management
- **Type Safety**: TypeScript for runtime safety

## 🎨 UI/UX Highlights

- **Dark Green & Magenta**: Healthcare-themed color scheme
- **Clean Cards**: Modern card-based layouts
- **Smooth Animations**: Subtle hover effects and transitions
- **Accessible Design**: Screen reader friendly components
- **Loading States**: User feedback for async operations

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] Payment processing integration
- [ ] GPS-based delivery tracking
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or run on different port
npm run dev -- --port 3001
```

**TypeScript Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Dependency Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 👨‍💻 Development

### Code Style
- Use TypeScript for all components
- Follow Material-UI patterns
- Implement responsive design
- Add proper error handling

### Component Structure
```typescript
'use client'
import { Box, Typography } from '@mui/material'

export default function Component() {
  return (
    <Box>
      <Typography>Content</Typography>
    </Box>
  )
}
```

## 📄 License

This project is part of a health-tech marketplace demonstration.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use Material-UI components
3. Maintain responsive design
4. Add comprehensive error handling
5. Include proper documentation

---

**Pharmastackx** - Connecting health with technology for better medication access.

*Built with Next.js, TypeScript, and Material-UI*