# Copilot Instructions for Hree Create Store

## Project Overview

Hree Create is a modern custom apparel e-commerce platform built with Next.js 15, featuring AI-powered design customization, cart management, and order processing. The app is deployed via Google AI Studio and uses the Gemini API for AI features.

## Build, Test & Development

### Development Commands
```bash
npm run dev       # Start development server (default: http://localhost:3000)
npm run build     # Build production bundle
npm start         # Start production server
npm run lint      # Run ESLint (uses eslint.config.mjs)
npm run clean     # Clean Next.js cache and build artifacts
```

### Testing
- No test suite is currently configured
- Form validation uses Yup schemas (via `@hookform/resolvers`)
- Component testing happens through sections in `src/sections/`

### Environment Setup
Required environment variables (see `.env.example`):
- `GEMINI_API_KEY` - Required for AI features (AI Studio injects this automatically)
- `APP_URL` - Application base URL (auto-injected in AI Studio)
- Server URL and vendor credentials are hardcoded in `src/global-config.js`

## Architecture

### Next.js App Router Structure
- **App Directory**: `src/app/` uses Next.js 15 App Router with React Server Components
- **Pages**: Most pages are client components (use `'use client'` directive)
- **Root Layout**: `src/app/layout.jsx` wraps all pages with:
  - Redux store provider
  - MUI theme provider
  - Global navigation (Navbar + Footer)
  - Global snackbar

### State Management: Redux + Redux Saga
The app uses a hybrid approach combining Redux Toolkit slices with Redux Saga for side effects:

**Redux Store** (`src/redux/store.js`):
- Uses `redux-persist` with localStorage
- Persisted slices: `auth`, `cart`, `vendor`, `profile`
- Non-persisted: `wishlist`
- Saga middleware for async operations

**Slices** (`src/redux/reducer/`):
- `auth` - User authentication state
- `cart` - Shopping cart with server sync
- `profile` - User profile data
- `wishlist` - Product wishlist
- `product` - Product catalog and filters
- `productFilter` - Search/filter state
- `vendor` - Vendor configuration
- `chat` - Customer support chat

**Sagas** (`src/redux/saga/`):
- Handle all async API calls
- Use `call` for API requests, `put` for dispatching actions
- Pattern: `watch*Saga` → `handle*Saga` → `api.*` call

### API Layer

**Two Axios Instances**:
1. **Client-side** (`src/lib/axios-client`):
   - Used in browser/client components
   - Automatically adds `Vendor` header (from `CONFIG.vendorToken`)
   - Automatically adds `Authorization: Bearer {token}` from persisted Redux state
   - Use `skipAuth: true` in config for guest requests

2. **Server-side** (`src/lib/axios-server`):
   - Used in Server Components and API routes
   - Only adds `Vendor` header (no auth)
   - Includes `fetcher` utility for SWR

**API Endpoints** (`src/api/endpoints.js`):
- Centralized endpoint definitions
- Functions for dynamic routes: `product.details(slug)`, `order.details(id)`
- Base URL from `CONFIG.serverUrl`

**API Modules** (`src/api/`):
- Each module exports functions (e.g., `getProducts`, `addToCart`)
- Client API uses `axiosInstance` (with auth)
- Server API uses `axiosServerInstance` (no auth)

### Routing & Navigation

**Path Definitions** (`src/routes/paths.js`):
- Centralized route definitions as constants
- Dynamic routes use functions: `paths.product.details(slug)`
- Use these paths instead of hardcoded strings

**Navigation Components** (`src/layout/nav-config-*.jsx`):
- Mobile navigation: `nav-config-mobile.jsx`
- Mobile bottom bar: `nav-config-mobile-bottom.jsx`
- Account menu: `nav-config-account.jsx`

### Component Organization

**Sections** (`src/sections/`):
- Page-specific components organized by feature
- Examples: `home/home-hero.jsx`, `checkout/quick-order-form.jsx`
- Contain business logic and connect to Redux

**Shared Components** (`src/components/`):
- Reusable UI components
- Notable components:
  - `custom-breadcrumbs` - Navigation breadcrumbs
  - `hook-form` - React Hook Form wrappers
  - `snackbar` - Global toast notifications (uses `sonner`)
  - `Navbar.jsx`, `Footer.jsx` - Layout components

**Custom Hooks** (`src/hooks/`):
- `use-boolean` - Toggle state management
- `use-mobile` - Responsive breakpoint detection
- `use-popover` - Popover state management
- `use-set-state` - Object state updates

### Styling

**Tailwind CSS v4**:
- Uses `@tailwindcss/postcss` (not traditional config file)
- Global styles in `src/app/globals.css`
- Utility-first approach with `clsx` and `tailwind-merge`
- Custom fonts: Inter (body), Space Grotesk (display)

**Material-UI Integration**:
- MUI components alongside Tailwind
- Custom theme in `src/theme/theme-provider.jsx`
- Theme classes generated via `src/theme/create-classes.js`

## Key Conventions

### Import Aliases
Always use `@/` path alias for imports:
```javascript
import { CONFIG } from '@/global-config';
import { paths } from '@/routes/paths';
import axiosInstance from '@/lib/axios-client';
```

### Authentication Flow
1. Auth tokens stored in Redux (persisted to localStorage key `persist:primary`)
2. `axios-client` automatically reads token from persisted state
3. Use `skipAuth: true` for guest requests (e.g., product listing)
4. Server-side calls never include auth (use client-side APIs for authenticated requests)

### Redux Patterns
**Dispatching Actions**:
```javascript
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/actions/cart';

const dispatch = useDispatch();
dispatch(addToCart({ productId, quantity }));
```

**Selecting State**:
```javascript
import { useSelector } from 'react-redux';
import { selectCartItems } from '@/redux/selectors';

const cartItems = useSelector(selectCartItems);
```

### Form Handling
- Use React Hook Form with Yup validation
- Wrap inputs with `src/components/hook-form/*` components
- Example pattern in `src/sections/checkout/quick-order-form.jsx`

### API Request Patterns
**Client-side** (in components/hooks):
```javascript
import { addProductToCart } from '@/api/cart';

const handleAdd = async () => {
  try {
    const response = await addProductToCart(productData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

**Server-side** (in Server Components):
```javascript
import { fetcher } from '@/lib/axios-server';
import { endpoints } from '@/api/endpoints';

const products = await fetcher(endpoints.product.list);
```

### Configuration
Global config in `src/global-config.js`:
- `CONFIG.serverUrl` - API base URL
- `CONFIG.assetsDir` - Asset base URL
- `CONFIG.vendorToken` - Required for all API requests
- `CONFIG.vendorId` - Vendor identifier
- Never commit tokens to git

### File Naming
- Components: PascalCase (e.g., `Navbar.jsx`, `DesignCard.jsx`)
- Utilities/hooks: kebab-case (e.g., `use-mobile.js`, `axios-client.js`)
- Sections: kebab-case (e.g., `home-hero.jsx`, `cart-summary.jsx`)

### AI Studio Specifics
- HMR is disabled via `DISABLE_HMR=true` to prevent flickering during agent edits
- Standalone output mode for Cloud Run deployment
- `motion` package must be transpiled (see `next.config.mjs`)

## Common Tasks

### Adding a New Redux Feature
1. Create slice in `src/redux/reducer/{feature}/{feature}-slice.js`
2. Create saga in `src/redux/saga/{feature}-saga.js`
3. Add to `rootReducer` in `src/redux/reducer/index.js`
4. Add to `rootSaga` in `src/redux/saga/index.js`
5. Export selectors in `src/redux/selectors.js`

### Adding a New API Endpoint
1. Add endpoint to `src/api/endpoints.js`
2. Create API function in `src/api/{feature}.js`
3. Use in saga or component as needed

### Adding a New Page
1. Create page file in `src/app/{route}/page.jsx`
2. Add path to `src/routes/paths.js`
3. Create section components in `src/sections/{feature}/`
4. Update navigation configs if needed

### Working with Forms
1. Define Yup schema for validation
2. Use `useForm` from `react-hook-form` with `yupResolver`
3. Wrap inputs with `@/components/hook-form/*` components
4. Handle submission with saga action or direct API call
