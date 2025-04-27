Microservices Architecture with NestJS and RabbitMQ
This project demonstrates a microservice architecture with two independent services (Auth Service and Product Service) communicating via RabbitMQ.

Architecture Overview
Auth Service: Handles user authentication, registration, and token validation.

Product Service: Manages product catalog with user-based authorization.

RabbitMQ: Facilitates inter-service communication.

MongoDB: Separate database for each service.

Inter-Service Communication Flow
When a user registers in Auth Service, it publishes a user.created event to RabbitMQ.

When Product Service needs to validate a token, it sends a request through RabbitMQ to Auth Service.

Auth Service validates the token and sends back a response through RabbitMQ.

Product Service uses the validation response to authorize user actions.

Prerequisites
Docker and Docker Compose

Node.js and npm (for local development)

Setup Instructions
Using Docker Compose (Recommended)
Clone the repository

bash
Copy
Edit
git clone <repository-url>
cd <repository-folder>
Copy .env.example files to .env in both services

bash
Copy
Edit
cp auth-service/.env.example auth-service/.env
cp product-service/.env.example product-service/.env
Run using Docker Compose

bash
Copy
Edit
docker-compose up -d
This will start all services:

RabbitMQ on port 5672 (15672 for management UI)

MongoDB on port 27017

Auth Service on port 3000

Product Service on port 3001

Manual Setup (For Development)
Auth Service
Navigate to the auth-service directory:

bash
Copy
Edit
cd auth-service
Install dependencies:

bash
Copy
Edit
npm install
Copy .env.example to .env and update the values as needed.

Start the service:

bash
Copy
Edit
npm run start:dev
Product Service
Navigate to the product-service directory:

bash
Copy
Edit
cd product-service
Install dependencies:

bash
Copy
Edit
npm install
Copy .env.example to .env and update the values as needed.

Start the service:

bash
Copy
Edit
npm run start:dev
