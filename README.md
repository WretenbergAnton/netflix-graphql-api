# Netflix GraphQL API

En GraphQL API för Netflix filmer och TV-serier med authentication.

## Teknologi

- Node.js + Apollo Server
- PostgreSQL + Prisma ORM
- JWT Authentication
- Docker + Docker Compose
- Postman + Newman (testing)
- GitHub Actions (CI/CD)

## Setup

### 1. Installera dependencies
```bash
npm install
```

### 2. Starta Docker
```bash
docker-compose up -d
```

### 3. Kör migrations
```bash
docker-compose exec api npx prisma migrate dev
```

### 4. Öppna GraphQL
```
http://localhost:4000
```

## Testing

### Lokal testing
```bash
npm test
```

### Prisma Studio
```bash
docker-compose exec api npx prisma studio
```

## API Endpoints

### Authentication

**Register User**
```graphql
mutation {
  registerUser(email: "user@example.com", password: "password", name: "User") {
    token
    user { id email name }
  }
}
```

**Login User**
```graphql
mutation {
  loginUser(email: "user@example.com", password: "password") {
    token
    user { id email }
  }
}
```

## CI/CD

Tester körs automatiskt på varje push/pull request via GitHub Actions.

Se `.github/workflows/test.yml` för detaljer.

## Postman

Importera `netflix-api.postman_collection.json` och `netflix-api.postman_environment.json` i Postman.
