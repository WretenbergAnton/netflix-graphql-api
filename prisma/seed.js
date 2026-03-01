const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function main() {
  console.log('🎬 Starting Netflix data import...\n');

  // Step 1: Create or find admin user
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
  } else {
    console.log(`✅ Admin user already exists\n`);
  }

  // Step 2: Import Movies
  console.log('🎥 Importing movies...');
  const movieFileContent = fs.readFileSync('./prisma/data/netflix_movies_detailed_up_to_2025.csv', 'utf-8');
  
  const movieRecords = parse(movieFileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let movieCount = 0;
  const batchSize = 100;
  let batch = [];

  for (const record of movieRecords) {
    batch.push({
      showId: record.show_id || `movie_${Date.now()}_${Math.random()}`,
      title: record.title || 'Unknown',
      director: record.director || null,
      cast: record.cast || null,
      country: record.country || null,
      dateAdded: record.date_added || null,
      releaseYear: record.release_year ? parseInt(record.release_year) : null,
      genres: record.genres || null,
      language: record.language || null,
      description: record.description || null,
      rating: record.rating ? parseFloat(record.rating) : null,
      popularity: record.popularity ? parseFloat(record.popularity) : null,
      voteCount: record.vote_count ? parseInt(record.vote_count) : null,
      voteAverage: record.vote_average ? parseFloat(record.vote_average) : null,
      budget: record.budget ? parseFloat(record.budget) : null,
      revenue: record.revenue ? parseFloat(record.revenue) : null,
      createdBy: adminUser.id,
    });

    if (batch.length >= batchSize) {
      try {
        await prisma.movie.createMany({
          data: batch,
          skipDuplicates: true,
        });
        movieCount += batch.length;

        if (movieCount % 1000 === 0) {
          console.log(`✅ Imported ${movieCount} movies...`);
        }
      } catch (error) {
        console.error('Error importing movies:', error.message);
      }
      batch = [];
    }
  }

  // Final batch
  if (batch.length > 0) {
    try {
      await prisma.movie.createMany({
        data: batch,
        skipDuplicates: true,
      });
      movieCount += batch.length;
    } catch (error) {
      console.error('Error importing final batch:', error.message);
    }
  }

  console.log(`✅ Imported ${movieCount} movies total\n`);
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
