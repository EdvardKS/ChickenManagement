# Restaurant Management System

## Project Overview
A comprehensive restaurant management system built with Next.js, TypeScript, PostgreSQL, and Drizzle ORM. The system provides intelligent insights, real-time tracking, and multilingual support for global restaurant operations.

## Current Architecture
- **Frontend**: Next.js with TypeScript, React, Wouter for routing
- **Backend**: Express.js with session management
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **Authentication**: Passport.js with local strategy

## Recent Changes
- ✅ **Implemented 4 key UI improvements for order management** (Jan 31, 2025):
  1. ✅ **Time selection component**: Added preset buttons (13:00, 13:30, 14:00, 14:30) plus manual time selector with dynamic default time based on current system time
  2. ✅ **Quantity selection component**: Added preset amount buttons (0.5, 1, 1.5, 2 kg) plus manual numeric input with validation 
  3. ✅ **Dynamic time defaults**: System automatically suggests appropriate pickup time based on current time (before 12:45 → 13:00, etc.)
  4. ✅ **WhatsApp confirmation**: Added "Confirmar por WhatsApp" button in order management menu that generates formatted messages with order details

- ✅ **Enhanced Admin Orders Page** (Feb 2, 2025):
  1. ✅ **Full viewport layout**: Admin orders page now occupies full screen width and height with proper responsive design
  2. ✅ **Integrated new components**: NewOrderDrawer now uses TimeSelector and QuantitySelector components for consistent UX
  3. ✅ **Improved visual design**: Added gradient background, card layouts, and better spacing for professional appearance
  4. ✅ **WhatsApp integration**: Existing WhatsApp functionality maintained in order management dropdown

- **New Components Created**:
  - `TimeSelector` component with preset buttons and manual time input
  - `QuantitySelector` component with preset amounts and manual quantity input
  - WhatsApp utility functions for message generation and validation
  - Enhanced OrderDrawer with WhatsApp functionality

- **Enhanced Admin Interface**: Updated admin orders page to use new selector components with reactive state management and better UX

## User Preferences
- Prefer Spanish language for UI elements
- Focus on practical restaurant operations features
- Maintain clean, professional design
- Implement reactive UI patterns with centralized state management

## Key Features
- Order management system
- Stock tracking and history
- Business hours management
- Admin dashboard with analytics
- Real-time data visualization
- PDF invoice generation
- Email notifications
- Google Business integration