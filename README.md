# ⚡ Bitespeed Backend Task — Identity Reconciliation

## Link
## [https://identity-7bit.onrender.com/api/v1/identify]

---
## 🧩 Overview
This project implements the **Identity Reconciliation API**  
It helps unify customer identities across multiple purchases made with **different combinations of emails and phone numbers**.

By- Samuel Masih
---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Language** | TypeScript |
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL (Neon.tech with pooled connection) |
| **Migrations** | Drizzle Kit |
| **Hosting** | Render.com |
| **Validation** | Custom Error Handling |
| **Performance** | Indexed Queries + Warm Pooling |

---

## 🧱 Database Schema

The `Contact` table is designed to link multiple records that belong to the same person.  
The oldest record acts as **primary**, and others become **secondary**.

```ts
model Contact {
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence String    @default("primary")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
}

Index Created
EXPLAIN ANALYZE SELECT * FROM "Contact" WHERE "email" = 'samuelmasih@gmail.com';


📦 BiteSpeed
 ┣ 📂 src
 ┃ ┣ 📂 controllers
 ┃ ┃ ┗ identifyController.ts      # Handles HTTP request/response
 ┃ ┣ 📂 services
 ┃ ┃ ┗ identifyService.ts         # Core business logic for identity resolution
 ┃ ┣ 📂 routers
 ┃ ┃ ┗ identify.ts                # Express router for /api/v1/identify
 ┃ ┣ 📂 db
 ┃ ┃ ┣ schema.ts                  # Drizzle ORM schema + indexes
 ┃ ┃ ┣ connection.ts              # Neon connection (with pooler + warmup)
 ┃ ┃ ┗ drizzle.config.ts          # Drizzle migration config
 ┃ ┣ 📂 models
 ┃ ┃ ┣ customError.ts             # Custom error class
 ┃ ┃ ┗ result.ts                  # Response model wrapper
 ┃ ┗ index.ts                     # Express app entry point
 ┣ .env
 ┣ package.json
 ┣ tsconfig.json
 ┗ README.md


git clone https://github.com/SamuelMasih777/identity.git
cd bitespeed

npm install

PORT=3000
DATABASE_URL="postgresql://neondb_owner:<password>@ep-rapid-haze-ad8v5568-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

npm run generate:migration
npm run migrate

npm run dev
---
