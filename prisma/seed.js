const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

function parseActors(actorString) {
  if (!actorString) return [];
  return actorString.split(',').map(actor => actor.trim()).filter(a => a);
}

function parseGenres(genreString) {
  if (!genreString) return [];
  return genreString.split(',').map(genre => genre.trim()).filter(g => g);
}

async function main() {
  console.log('🎬 Starting Netflix data import with normalization...\n');

  // Step 1: Create admin user
  console.log('👤 Creating admin user...');
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@netflix.com' },
  });

  if (!adminUser) {
    const hashedPassword = await hashPassword('admin123');
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@netflix.com',
        password: hashedPassword,
        name: 'Netflix Admin',
      },
    });
    console.log(`✅ Created admin user: ${adminUser.email}\n`);
  }

  // Step 2: Import Movies with normalized data
  console.log('🎥 Importing movies with actors and genres...');
  const movieFileContent = fs.readFileSync('./prisma/data/netflix_movies_detailed_up_to_2025.csv', 'utf-8');
  
  const movieRecords = parse(movieFileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let movieCount = 0;
  let actorCount = 0;
  let genreCount = 0;

  for (const record of movieRecords) {
    try {
      // Create movie
      const movie = await prisma.movie.create({
        data: {
          showId: record.show_id || `movie_${Date.now()}_${Math.random()}`,
          title: record.title || 'Unknown',
          releaseYear: record.release_year ? parseInt(record.release_year) : null,
          description: record.description || null,
          rating: record.rating ? parseFloat(record.rating) : null,
          popularity: record.popularity ? parseFloat(record.popularity) : null,
          voteCount: record.vote_count ? parseInt(record.vote_count) : null,
          voteAverage: record.vote_average ? parseFloat(record.vote_average) : null,
          budget: record.budget ? parseFloat(record.budget) : null,
          revenue: record.revenue ? parseFloat(record.revenue) : null,
          dateAdded: record.date_added || null,
          createdBy: adminUser.id,
        },
      });

      movieCount++;

      // Parse and create actors
      const actors = parseActors(record.cast);
      for (const actorName of actors) {
        await prisma.actor.create({
          data: {
            name: actorName,
            movieId: movie.id,
          },
        });
        actorCount++;
      }

      // Parse and create genres
      const genres = parseGenres(record.genres);
      for (const genreName of genres) {
        await prisma.genre.create({
          data: {
            name: genreName,
            movieId: movie.id,
          },
        });
        genreCount++;
      }

      if (movieCount % 1000 === 0) {
        console.log(`✅ Imported ${movieCount} movies, ${actorCount} actors, ${genreCount} genres...`);
      }
    } catch (error) {
      // Silently skip duplicates
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Movies: ${movieCount}`);
  console.log(`   Actors: ${actorCount}`);
  console.log(`   Genres: ${genreCount}\n`);
  console.log(`🎉 Netflix data import complete!`);
  console.log(`\nAdmin credentials:`);
  console.log(`Email: admin@netflix.com`);
  console.log(`Password: admin123`);
  
  await prisma.$disconnect();
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
