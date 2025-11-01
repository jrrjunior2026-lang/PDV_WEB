# ERP + PDV Fiscal - Backend

This directory contains the backend for the application, built with [NestJS](https://nestjs.com/) and [Prisma](https://www.prisma.io/).

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/) database running locally or accessible.

### 2. Installation

Install the project dependencies:
```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and fill in your database connection string and a secret for JWT:
```bash
cp .env.example .env
```
Open the `.env` file and edit the `DATABASE_URL` and `JWT_SECRET` variables.

### 4. Database Migration

Prisma uses the `schema.prisma` file to manage the database schema. To create the tables in your database, run the migrate command:
```bash
npx prisma migrate dev --name init
```
This will create the database schema based on the models defined in `prisma/schema.prisma`. It will also generate the Prisma Client, which is a type-safe database client.

### 5. Running the Application

To start the backend server in development mode (with hot-reloading):
```bash
npm run start:dev
```
The server will start on the port defined in your `.env` file (default is 3000).

## Project Structure

- `src/`: Contains the application source code.
  - `main.ts`: The application entry point.
  - `app.module.ts`: The root module of the application.
  - Other modules (e.g., `products`, `users`, `auth`) will be created here.
- `prisma/`: Contains database-related files.
  - `schema.prisma`: The single source of truth for your database schema.
  - `migrations/`: Contains the generated SQL migration files.
