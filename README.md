# Microservices Architecture with NestJS and RabbitMQ

This project demonstrates a microservice architecture with two independent services (**Auth Service** and **Product Service**) communicating via **RabbitMQ**.

---

## Architecture Overview

- **Auth Service**: Handles user authentication, registration, and token validation.
- **Product Service**: Manages product catalog with user-based authorization.
- **RabbitMQ**: Facilitates inter-service communication.
- **MongoDB**: Separate database for each service.

---

## Inter-Service Communication Flow

- When a user registers in **Auth Service**, it publishes a `user.created` event to **RabbitMQ**.
- When **Product Service** needs to validate a token, it sends a request through **RabbitMQ** to **Auth Service**.
- **Auth Service** validates the token and sends back a response through **RabbitMQ**.
- **Product Service** uses the validation response to authorize user actions.

---

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)

---

## Setup Instructions

### Using Docker Compose (Recommended)

1. **Clone the repository**.

2. **Copy `.env.example` files to `.env`** in both services:

   ```bash
   cp auth-service/.env.example auth-service/.env
   cp product-service/.env.example product-service/.env
