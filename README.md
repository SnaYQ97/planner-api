# Express Application with Prisma and TypeScript

This project is an Express application utilizing Prisma with TypeScript for managing user data in a SQL database. It provides basic functionalities to create, retrieve, and manage users.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm
- A SQL database (PostgreSQL, MySQL, etc.)

### Installing

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Set up your database and configure the `.env` file with your database connection details.
4. Run `npx prisma migrate dev` to create the database schema.
5. Start the server with `npm start`.

## Running the tests

To run the automated tests for this system, use:

```bash
npm test
```

### Notes

Tests: 
 - units - jest
 - integration - jest
 - e2e - cyprus

