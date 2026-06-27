# Investment Tracker

Investment Tracker is a microservices-based investment portfolio tracking application that enables users to manage their investments and monitor their portfolio value using real-time market data.

The application allows users to create portfolios, add investment assets, retrieve live market prices, and analyze portfolio performance through a modern dashboard interface.

---

# Project Goals

The purpose of this project is to demonstrate:

* Microservices Architecture
* REST API Development
* External API Integrations
* Database Design
* Caching Strategies
* React Frontend Development
* Real-Time Portfolio Valuation

The project focuses on investment portfolio management while keeping the architecture simple and maintainable.

---
# Services

## Portfolio Service

Portfolio Service is responsible for managing investment data and portfolio calculations.

Responsibilities:

* Portfolio CRUD operations
* Asset CRUD operations
* Portfolio summary generation
* Portfolio valuation calculations
* Database access

Technology:

* .NET 8 Web API
* Entity Framework Core
* Neon Database (PostgreSQL)

---

## Market Service

Market Service is responsible for retrieving market data from external providers.

Responsibilities:

* Currency exchange rates
* Stock prices
* Cryptocurrency prices

Technology:

* .NET 8 Web API
* HttpClient
* Redis Cache

---

## Redis

Redis is used as a caching layer for market data.

Benefits:

* Faster response times
* Reduced external API calls
* Lower risk of hitting API rate limits
* Improved application performance

---
# System Architecture

The application is built using a microservices architecture.

```text
React Frontend
       |
       |
       v
Portfolio Service
       |
       +----------------+
       |                |
       v                v
Neon Database      Market Service
(PostgreSQL)           |
                         v
                       Redis
                         |
               +---------+---------+
               |                   |
               v                   v
         Frankfurter API     Twelve Data API
```
<img width="1479" height="1353" alt="diagram-export-07 06 2026-20_57_20" src="https://github.com/user-attachments/assets/3deffd36-7111-4bfa-8c51-d1ddd3dde259" />

---

# External Integrations

## Frankfurter API

Used for:

* Real-time currency exchange rates
* 
---

## Twelve Data API

Used for:

* Stock market prices (US and BIST)
* Cryptocurrency prices
* 
---

# Frontend

The frontend provides the user interface for managing and monitoring investment portfolios.

Technology:

* React
* Vite
* Axios
* Recharts

---

# Application Pages

## Dashboard

Main overview page.

Displays:

* Total Portfolio Value
* Total Portfolio Count
* Total Asset Count
* Recent Assets

---

## Portfolios

Portfolio management page.

Features:

* Create Portfolio
* View Portfolio
* Delete Portfolio

---

## Portfolio Details

Detailed portfolio view.

Displays:

* Asset List
* Asset Quantities
* Current Market Values
* Total Portfolio Value

---

## Add Asset

Asset creation page.

Supported asset types:

* Currency
* Stock
* Cryptocurrency

---

## Analytics

Analytics and visualization page.

Displays:

* Asset Allocation Chart
* Portfolio Distribution Chart

---

# Database

The application uses Neon Database, a serverless PostgreSQL platform.

Technology:

* Neon Database
* PostgreSQL
* Entity Framework Core

---

# Technology Stack

## Backend

* .NET 8
* ASP.NET Core Web API
* Entity Framework Core

## Frontend

* React
* Vite
* Axios
* Recharts

## Database

* Neon Database (PostgreSQL)

## Caching

* Redis

## Architecture

* Microservices Architecture
* REST APIs

## External APIs

* Frankfurter API
* Twelve Data API

---

# MVP Scope

The following features are intentionally excluded from the MVP version:

* Authentication
* Authorization
* JWT
* User Management
* Notifications
* Email Service
* RabbitMQ
* Kafka
* API Gateway
* Background Jobs
* Audit Logging
* Role Management

The primary goal of this project is to demonstrate investment portfolio management, microservices communication, caching, external API integrations, and modern full-stack application development using .NET and React.
