# Netflix GraphQL API

En fullständig GraphQL API byggt med Node.js, Apollo Server v4 och PostgreSQL. Serverar en dataset med 15,465 filmer med full CRUD-funktionalitet, JWT-autentisering och automatiserad testning.

**Live API:** https://netflix-graphql-api-production.up.railway.app/graphql

---

## Funktioner

### Primär resurs: Movies
- **Create** - Lägg till nya filmer med `addMovie` mutation
- **Read** - Hämta filmer med pagination
- **Read** - Hämta en film via ID
- **Update** - Uppdatera filmdetaljer
- **Delete** - Ta bort filmer

### Sekundära resurser
- **Actors** - Bläddra bland skådespelare
- **Genres** - Utforska filmkategorier
- **Ratings** - Visa användarrecensioner

### Övriga funktioner
- JWT-autentisering (registrera/logga in)
- Pagination med metadata
- Fulltext-sökning
- 27+ automatiserade testfall
- CI/CD med GitHub Actions
- Interactive GraphQL Playground
- PostgreSQL med Prisma ORM

---

## Teknik

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **GraphQL:** Apollo Server v4
- **ORM:** Prisma
- **Databas:** PostgreSQL (Railway)
- **Autentisering:** JWT
- **Testing:** Newman/Postman
- **Deployment:** Railway

---

## Snabbstart

### 1. Klona repositoriet
```bash
git clone https://github.com/WretenbergAnton/netflix-graphql-api.git
cd netflix-graphql-api
```

### 2. Installera beroenden
```bash
npm install
```

### 3. Konfigurering
```bash
cp .env.example .env
# Redigera .env med din DATABASE_URL
```

### 4. Databas
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Starta servern
```bash
npm start
```

Servern körs på `http://localhost:4000/graphql`

---

## Seed Script

Seed-scriptet fyller databasen med 15,465 filmer.

### Lokal utveckling
```bash
npx prisma db seed
# Snabbt - ~1 minut
```

### Railway (Production)
```bash
# Körs automatiskt på deployment
# Data består mellan deployments - BEHÖVER INTE ÖM-SEEDA
```

**Dataset:**
- Källa: Kaggle Netflix + TMDB
- Storlek: 15,465 filmer, 74,502 skådespelare
- Format: CSV-seed

---

## Autentisering

### Registrera användare
```graphql
mutation {
  registerUser(
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

### Logga in
```graphql
mutation {
  loginUser(
    email: "user@example.com"
    password: "password123"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

### Använd token

Lägg till i **Authorization header** för skyddade operationer:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Query-exempel

### Hämta alla filmer (Pagination)
```graphql
{
  movies(limit: 10, offset: 0) {
    movies {
      id
      title
      description
      releaseYear
      rating
      actors {
        name
        character
      }
      genres {
        name
      }
    }
    totalCount
    hasNextPage
    totalPages
  }
}
```

### Hämta en film
```graphql
{
  movie(id: 1) {
    id
    title
    description
    releaseYear
    rating
    actors {
      name
      character
    }
  }
}
```

### Sök filmer
```graphql
{
  searchMovies(title: "Matrix") {
    id
    title
    releaseYear
    rating
  }
}
```

### Hämta alla skådespelare
```graphql
{
  actors {
    id
    name
    character
  }
}
```

### Hämta filmrecensioner
```graphql
{
  ratings(movieId: 1) {
    id
    score
    comment
    createdAt
  }
}
```

---

## 🔨 Mutation-exempel

### Skapa film (Kräver JWT)
```graphql
mutation {
  addMovie(
    title: "The Matrix"
    releaseYear: 1999
    description: "En datorhacker lär sig om realiteten"
    rating: 8.7
  ) {
    id
    title
    rating
  }
}
```

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

### Uppdatera film (Kräver JWT)
```graphql
mutation {
  updateMovie(
    id: 1
    title: "The Matrix Reloaded"
    rating: 7.2
  ) {
    id
    title
    rating
  }
}
```

### Ta bort film (Kräver JWT)
```graphql
mutation {
  deleteMovie(id: 1)
}
```

Returnerar: `true` (lyckades) eller `false` (misslyckades)

---

## Testning

### Kör alla tester
```bash
npx newman run netflix-api.postman_collection.json \
  -e production.postman_environment.json
```

### Test-täckning

27+ testfall som täcker:
- Användarregistrering
- Användarlogin
- Filmsökning
- Skapa film
- Uppdatera film
- Ta bort film
- Felhantering (401, 404, 400)
- Kompletta workflows

### Interaktiv testning

**Apollo Sandbox:**
```
https://sandbox.apollo.dev
Endpoint: https://netflix-graphql-api-production.up.railway.app/graphql
```

**Postman Web:**
```
https://web.postman.co
Importera: netflix-api.postman_collection.json
```

---

## Deployment

### Deploy till Railway

1. **Push till GitHub**
```bash
git push github main
```

2. **Railway ansluter automatiskt**
- Går till https://railway.app
- Ansluter GitHub-repositoriet
- Auto-deployar vid push

3. **Environment variables**
```
JWT_SECRET=din-hemliga-nyckel
NODE_ENV=production
```

4. **Databas**
- PostgreSQL auto-skapas
- Migrationer körs på deploy
- Data består mellan deployments

---

## Felhantering

### Felformat

Alla fel returnerar ett konsistent format:
```json
{
  "errors": [
    {
      "message": "Beskrivande felmeddelande"
    }
  ],
  "data": null
}
```

### Vanliga fel

| Scenario | Message |
|----------|---------|
| Saknad autentisering | "Authentication required. Please provide a valid JWT token." |
| Ogiltig inmatning | "Title is required" |
| Resurs hittades inte | "Movie not found" |
| Dubblerat email | "User with this email already exists" |
| Felaktigt lösenord | "Invalid email or password" |

---

## Databassschema

| Modell | Typ | Syfte |
|--------|-----|-------|
| **User** | Auth | Användarregistrering & login |
| **Movie** | Primär (CRUD) | Filmer med full CRUD |
| **Actor** | Sekundär (Read-only) | Skådespielare |
| **Genre** | Sekundär (Read-only) | Filmkategorier |
| **Rating** | Sekundär (Read-only) | Användarrecensioner |

---

## Status

- API fullt funktionell
- Databas seedlad (15,465 filmer)
- Autentisering implementerad
- Full CRUD-funktionalitet
- 27+ automatiserade tester
- CI/CD-pipeline aktiv
- Deployad till produktion
- Dokumentation komplett

---

**Uppdaterad:** 24 mars 2026  
**Av:** Anton Wretenberg