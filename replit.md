# RAD Ad Display Platform

## Overview

RAD (rebrand of TAXIHUB) is a sophisticated ad display platform demo built with React, TypeScript, and modern web technologies. The application provides comprehensive ad management capabilities including scheduling, player preview, interactive mapping, and analytics for digital advertising displays. It features a role-based authentication system, real-time metrics dashboard, drag-and-drop scheduling interface, and mobile-responsive design optimized for both desktop and mobile workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing with hash-based navigation
- **State Management**: Custom localStorage-based store with async simulation for demo purposes
- **UI Components**: Radix UI primitives with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens and mobile-first responsive design
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture  
- **Server**: Express.js with TypeScript for API endpoints and static file serving
- **Database Layer**: Drizzle ORM with PostgreSQL schema definitions for production-ready data modeling
- **Storage Interface**: Abstracted storage pattern with in-memory implementation for demo mode and database integration for production
- **Session Management**: Built-in session handling with localStorage persistence for demo authentication

### Data Storage Solutions
- **Demo Mode**: localStorage with "RAD_DB" key for client-side persistence of all application data
- **Production Ready**: PostgreSQL database with Drizzle ORM migrations and connection pooling
- **Schema Design**: Normalized tables for users, screens, ads, schedules, and activity logs with proper relationships and constraints

### Authentication and Authorization
- **Demo Authentication**: Simple email-based login with role simulation (admin@rad.test accepts any password)
- **Role-Based Access**: Admin and Operator roles with different permission levels
- **Session Persistence**: User state maintained in localStorage with automatic session restoration
- **Production Security**: Prepared for real authentication with password hashing and secure session management

### External Dependencies
- **UI Framework**: @radix-ui components for accessibility-compliant interactive elements
- **Development Tools**: Vite with runtime error overlay and hot module replacement
- **Database**: @neondatabase/serverless for PostgreSQL cloud hosting
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach
- **Type Safety**: TypeScript with strict configuration for compile-time error prevention
- **Routing**: wouter for minimal client-side routing without unnecessary complexity
- **Query Management**: @tanstack/react-query for server state management and caching
- **Form Handling**: @hookform/resolvers with react-hook-form for form validation and submission
- **Date Utilities**: date-fns for consistent date manipulation and formatting