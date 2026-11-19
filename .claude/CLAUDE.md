# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `yarn start` - Start webpack dev server on http://localhost:9000
- `yarn build` - Generate production build to `/dist`
- `yarn build:analyze` - Build with bundle analyzer visualization

### Testing & Quality

- `yarn test` - Run both Karma (AngularJS) and Jest (React/TypeScript) test suites
- `yarn lint` - Run ESLint on app and test files
- `yarn lint:ts` - Run TypeScript compiler type checking
- `yarn prettier:check` - Check code formatting
- `yarn prettier:write` - Auto-format code

### Internationalization

- `yarn angular-gettext-extract` - Extract strings for translation to `languages/ert.pot`

### Next.js Integration (Experimental)

- `yarn next:dev` - Run Next.js development server
- `yarn next:build` - Build Next.js application
- `yarn next:start` - Start Next.js production server

## Architecture Overview

### Hybrid Framework Structure

This is a **hybrid application** combining AngularJS (legacy) with React components and Next.js integration:

- **AngularJS 1.8** - Main application framework with controllers, directives, and services
- **React 18** - New components integrated via `react2angular` and `angular2react`
- **Next.js 12** - Experimental integration for new pages
- **TypeScript** - Used for newer components and services
- **Webpack 5** - Primary build system

### Directory Structure

#### Core Application (`/app`)

- `app/scripts/main.js` - Main entry point importing all modules
- `app/scripts/app.module.js` - AngularJS module definition and dependencies
- `app/scripts/app.config.js` - Routing configuration and environment setup
- `app/features/<feature>/` - One folder per route: its controller (`<feature>.controller.js` or `.ts`), its `.html` templates, and its Karma spec (`<feature>.controller.spec.js`)
- `app/scripts/components/` - Mix of React components and AngularJS components
- `app/scripts/services/` - AngularJS services and API interactions
- `app/scripts/directives/` - AngularJS directives
- `app/scripts/utils/` - Utility functions
- `app/scripts/hooks/` - React hooks

#### Next.js Integration (`/pages`)

- `pages/` - Next.js pages (experimental feature)
- `pages/_app.page.tsx` - Next.js app wrapper
- `pages/_document.page.tsx` - Custom document structure

#### Testing

- Tests sit next to the code they test: `*.spec.js` (Karma/Jasmine) for AngularJS controllers, directives, services, and filters, including `.ts` ones; `*.test.ts(x)` (Jest) for React components and hooks under `app/scripts/`
- `test/spec/` - Shared Karma fixtures and setup (`testData.spec.js`, `mockHttpBackend.spec.js`)
- `__tests__/` - Shared Jest fixtures and setup (`fixtures.ts`, `util/setup.ts`)
- Uses dual test runners: **Karma** for AngularJS, **Jest** for React

### Key Technologies & Dependencies

#### Frontend Frameworks

- AngularJS with UI-Bootstrap, UI-Tree, angular-gettext for i18n
- React with react-bootstrap
- Bootstrap 3 (SASS-based styling)

#### Build Tools

- Webpack 5 with dev server
- Babel for JavaScript/TypeScript transpilation
- SASS/CSS processing
- Image optimization and favicon generation

#### Payment Integration

- `@cruglobal/cru-payments` for payment processing
- Rollbar for error tracking

### Development Patterns

#### Component Integration

- React components are wrapped for AngularJS using `react2angular`
- AngularJS components can be used in React via `angular2react`
- TypeScript definitions in `/types` directory
- Custom Angular wrapper files named `*_angular.ts`

#### Environment Configuration

Environment-specific settings in `app.config.js`:

- Development: `localhost` with staging API
- Staging: `stage.eventregistrationtool.com`
- Production: `www.eventregistrationtool.com`

#### Code Style

- ESLint with Angular and React plugins
- Prettier for consistent formatting
- Husky for pre-commit hooks
- TypeScript strict mode is on (`"strict": true` in `tsconfig.json`); `.js` files are not type-checked

### API Integration

- RESTful API integration via AngularJS services
- HTTP interceptors for authentication, error handling, and validation
- Default staging API: `https://api.stage.eventregistrationtool.com`
- Local development can be configured to use `http://localhost:8080`

### Testing Strategy

- **Karma + Jasmine** for AngularJS components and services
- **Jest + Testing Library** for React components and TypeScript code
- Coverage collection configured for TypeScript files
- Test files: `*.spec.js` (Karma) and `*.test.ts/tsx` (Jest)
