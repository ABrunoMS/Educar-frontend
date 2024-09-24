# Educar Odyssey Backoffice

This is the backoffice application for Educar Odyssey, built using modern front-end technologies like Vite, React, and TypeScript.

## Project Setup

### Prerequisites

Ensure that you have the following tools installed:

- Node.js (>= 16.x)
- [pnpm](https://pnpm.io/motivation) (package manager)


### Getting Started

- Install dependencies: run the command `pnpm i`
- Start application in development mode: run the command `pnpm dev`, it should be available at [localhost:5000](http://localhost:5000/) by default


### Building

- To build the application run the command `pnpm build`, all the compiled files will be at the `./dist`
- To preview the application in production mode, run the command `pnpm preview`, the prompt will display the address where the application is being served


### Linting

To run ESLint and check for code quality issues:

- Run the command `pnpm lint`


### Environment Variables

- You can configure the application using environment variables inside the `.env` file at the root of your project
- You need one `.env` file for each environment you have. Ex. if you need a staging build, add a `.env.staging` file with the correct values then create a new build command passing the `--mode staging` as a parameter


## API Swagger - Documentation

[Dev - API Documentation](https://dev.odisseia.pro/api/index.html?url=/api/specification.json)