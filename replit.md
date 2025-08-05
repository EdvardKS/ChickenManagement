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

- ✅ **Arreglado el problema de parpadeo de pedidos** (Feb 2, 2025):
  1. ✅ **Actualizaciones optimistas mejoradas**: Cambio de `setQueryData` a `setQueriesData` para actualizar todas las instancias del cache
  2. ✅ **Polling inteligente**: Implementado refetch automático cada 30 segundos para sincronización entre dispositivos
  3. ✅ **Refetch inmediato**: Al cerrar modales de nuevo pedido/stock se actualiza inmediatamente
  4. ✅ **Eliminado listener global**: Removido el event handler que causaba refetch innecesarios
  5. ✅ **Sincronización multi-dispositivo**: Los cambios en un dispositivo se reflejan en otros dentro de 30 segundos
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
  5. ✅ **Full-screen NewOrderDrawer**: Modal now occupies entire screen with spacious card-based layout
  6. ✅ **Terminology fix**: Changed from "kg" to "pollos" in quantity selector for accurate chicken ordering
  7. ✅ **Enhanced selectors**: Both TimeSelector and QuantitySelector now have unified design with preset buttons + dropdown
  8. ✅ **Smart time defaults**: Time selection automatically suggests appropriate times based on current time
  9. ✅ **Default selections**: QuantitySelector defaults to "1 pollo", TimeSelector uses smart time logic

- ✅ **Complete Voice Recognition System Implementation** (Feb 3, 2025):
  1. ✅ **OpenAI Whisper Integration**: Backend uses OpenAI Whisper API for accurate Spanish speech-to-text
  2. ✅ **Intelligent Voice Rules**: System processes voice commands like "Crear pedido para María dos pollos para las dos"
  3. ✅ **Automatic Order Creation**: Extracts customer name, quantity, and pickup time from voice commands
  4. ✅ **Real-time Speech Visualization**: Web Speech API shows live transcription while user speaks
  5. ✅ **Dual Audio Processing**: Combines Web Audio API for visualization with server processing for accuracy
  6. ✅ **Enhanced UI Feedback**: Modal shows interim transcript, success messages, and order details
  7. ✅ **Environment Configuration**: Proper dotenv setup for OpenAI API key management
  8. ✅ **Error Handling**: Comprehensive error states and fallback mechanisms
  9. ✅ **Voice Button Integration**: Floating voice button on admin orders page with animated states
  10. ✅ **Spanish Time Processing**: Handles expressions like "tres y media", "una y media" correctly
  11. ✅ **Date Conversion Fix**: Properly converts HH:MM time format to valid Date objects
  12. ✅ **Non-intrusive UX**: System creates orders automatically without opening new order drawer
  13. ✅ **Real-time Table Updates**: New orders appear instantly in the table via optimistic cache updates
  14. ✅ **Full Name Recognition**: Enhanced patterns capture complete names with surnames (e.g., "Pedro Hernández Ortiz")
  15. ✅ **"Viene" Pattern Recognition**: Added specific patterns for "viene/llega [Nombre Apellido]" expressions
  16. ✅ **Time Afternoon/Morning Processing**: Fixed "3 de la tarde" → "15:00", "8 de la mañana" → "08:00" conversions
  17. ✅ **Name Pattern Without Keywords**: Added pattern ^([nombres]+)\s+(?:cantidad) for "Fernando García Ortiz dos pollos"
  18. ✅ **Quarter Time Support**: Added "y cuarto" patterns - "una y cuarto" → "13:15"
  19. ✅ **Debug Logging**: Added comprehensive pattern matching logs for troubleshooting

- ✅ **Enhanced Voice Recognition with GPT Second Verification** (Feb 5, 2025):
  1. ✅ **GPT-4 Second Verification**: Implemented dual-layer processing where GPT-4 analyzes Whisper transcription first
  2. ✅ **Few-Shot Learning Examples**: Added comprehensive examples showing GPT exactly how to extract customer name, quantity, and pickup time
  3. ✅ **Business Hours Validation**: Automatic time normalization ensuring all orders fall within 11:00-17:00 range
  4. ✅ **Smart Time Conversion**: "Ocho" without AM/PM context converts to afternoon (20:00), then adjusts to business hours (17:00)
  5. ✅ **Fallback Processing**: If GPT fails, system falls back to regex-based extraction for reliability
  6. ✅ **Detailed Response Messages**: Enhanced feedback showing exactly what was extracted (name, quantity, time)
  7. ✅ **JSON Structured Output**: GPT returns properly formatted JSON with customerName, quantity, pickupTime, phone fields
  8. ✅ **Time Normalization Function**: Validates and corrects times outside business hours automatically
  9. ✅ **Enhanced Error Handling**: Clear user guidance when extraction fails with specific missing information
  10. ✅ **Temperature Control**: Low temperature (0.1) for consistent, reliable extraction results

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