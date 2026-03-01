const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parse/sync');
const prisma = new PrismaClient();

async function main() {
  console.log('🎬 Starting Netflix data import...\n');

  // Import Movies
  console.log('🎥 Importing movies...');
  const movieFileContent = fs.readFileSync('./prisma/data/netflix_movies_detailed_up_to_2025.csv', 'utf-8');
  const movieRecords = csv.parse(movieFileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  await prisma.movie.deleteMany();

  // Use userId = 1 for seed data (system user)
  const SYSTEM_USER_ID = 1;

  let movieCount = 0;
  for (const record of movieRecords) {
    try {
      await prisma.movie.create({
        data: {
          showId: record.show_id,
          title: record.title || 'Unknown',
          director: record.director || null,
          cast: record.cast || null,
          country: record.country || null,
          dateAdded: record.date_added || null,
          releaseYear: record.release_year ? parseInt(record.release_year) : null,
          rating: record.rating ? parseFloat(record.rating) : null,
          genres: record.genres || null,
          language: record.language || null,
          description: record.description || null,
          popularity: record.popularity ? parseFloat(record.popularity) : null,
          voteCount: record.vote_count ? parseInt(record.vote_count) : null,
          voteAverage: record.vote_average ? parseFloat(record.vote_average) : null,
          budget: record.budget ? parseFloat(record.budget) : null,
          revenue: record.revenue ? parseFloat(record.revenue) : null,
          createdBy: SYSTEM_USER_ID,
        },
      });
      movieCount++;
      if (movieCount % 2000 === 0) {
        console.log(`✅ Imported ${movieCount} movies...`);
      }
    } catch (error) {
      // Skip duplicates or errors
    }
  }

  console.log(`✅ Imported ${movieCount} movies total\n`);
  console.log(`🎉 Netflix data import complete!`);
  
  await prisma.$disconnect();
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
