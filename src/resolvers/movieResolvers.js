const { PrismaClient } = require("@prisma/client");
const { getAuthenticatedUserId } = require("../utils/authMiddleware");

const prisma = new PrismaClient();

const movieResolvers = {
  // Queries
  Query: {
    /**
     * Returns a paginated list of movies ordered by rating descending.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ limit?: number, offset?: number }} args - Pagination options (default limit 10, offset 0).
     * @returns {Promise<{ movies: object[], totalCount: number, hasNextPage: boolean, totalPages: number }>}
     */
    movies: async (_, { limit = 10, offset = 0 }) => {
      const [movies, totalCount] = await Promise.all([
        prisma.movie.findMany({
          take: limit,
          skip: offset,
          orderBy: { rating: "desc" },
          include: {
            actors: true,
            genres: true,
          },
        }),
        prisma.movie.count(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = offset + limit < totalCount;

      return {
        movies,
        totalCount,
        hasNextPage,
        totalPages,
      };
    },

    /**
     * Fetches a single movie by its ID, including actors and genres.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ id: number }} args - The movie's database ID.
     * @returns {Promise<object | null>} The movie, or null if not found.
     */
    movie: async (_, { id }) => {
      return await prisma.movie.findUnique({
        where: { id },
        include: {
          actors: true,
          genres: true,
        },
      });
    },

    /**
     * Searches movies by title (case-insensitive substring match), returning up to 20 results.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ title: string }} args - The title substring to search for.
     * @returns {Promise<object[]>} Matching movies with actors and genres.
     */
    searchMovies: async (_, { title }) => {
      return await prisma.movie.findMany({
        where: {
          title: {
            contains: title,
            mode: "insensitive",
          },
        },
        take: 20,
        include: {
          actors: true,
          genres: true,
        },
      });
    },

    /**
     * Returns all actors in the database.
     * @returns {Promise<object[]>} All actors with their associated movie.
     */
    actors: async () => {
      return await prisma.actor.findMany({
        include: {
          movie: true,
        },
      });
    },

    /**
     * Returns all ratings for a given movie, ordered newest first.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ movieId: number }} args - The ID of the movie to fetch ratings for.
     * @returns {Promise<object[]>} Ratings for the movie.
     * @throws {Error} If movieId is not provided.
     */
    ratings: async (_, { movieId }) => {
      if (!movieId) {
        throw new Error("movieId is required");
      }
      
      return await prisma.rating.findMany({
        where: { movieId },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  // Mutations
  Mutation: {
    /**
     * Creates a new movie. Requires authentication.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ title: string, releaseYear?: number, description?: string, rating?: number }} args - Movie data.
     * @param {{ authorization: string | null }} context - Apollo context containing the Authorization header.
     * @returns {Promise<object>} The newly created movie.
     * @throws {Error} If the user is not authenticated or title is missing.
     */
    addMovie: async (
      _,
      { title, releaseYear, description, rating },
      context,
    ) => {
      const userId = getAuthenticatedUserId(context.authorization);

      if (!title) {
        throw new Error("Title is required");
      }

      const movie = await prisma.movie.create({
        data: {
          title,
          releaseYear: releaseYear || null,
          description: description || null,
          rating: rating || null,
          createdBy: userId,
        },
        include: {
          actors: true,
          genres: true,
        },
      });

      return {
        id: movie.id,
        title: movie.title,
        releaseYear: movie.releaseYear,
        description: movie.description,
        rating: movie.rating,
        actors: movie.actors,
        genres: movie.genres,
        createdAt: movie.createdAt.toISOString(),
      };
    },

    /**
     * Updates an existing movie. Only the user who created the movie may update it.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ id: number, title?: string, releaseYear?: number, description?: string, rating?: number }} args - Fields to update.
     * @param {{ authorization: string | null }} context - Apollo context containing the Authorization header.
     * @returns {Promise<object | null>} The updated movie.
     * @throws {Error} If unauthenticated, movie not found, or user does not own the movie.
     */
    updateMovie: async (
      _,
      { id, title, releaseYear, description, rating },
      context,
    ) => {
      const userId = getAuthenticatedUserId(context.authorization);

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        throw new Error("Movie not found");
      }

      if (movie.createdBy !== userId) {
        throw new Error("You can only update your own movies");
      }

      const updatedMovie = await prisma.movie.update({
        where: { id },
        data: {
          title: title || movie.title,
          releaseYear: releaseYear || movie.releaseYear,
          description: description || movie.description,
          rating: rating || movie.rating,
        },
        include: {
          actors: true,
          genres: true,
        },
      });

      return {
        id: updatedMovie.id,
        title: updatedMovie.title,
        releaseYear: updatedMovie.releaseYear,
        description: updatedMovie.description,
        rating: updatedMovie.rating,
        actors: updatedMovie.actors,
        genres: updatedMovie.genres,
        createdAt: updatedMovie.createdAt.toISOString(),
      };
    },

    /**
     * Deletes a movie by ID. Only the user who created the movie may delete it.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ id: number }} args - The ID of the movie to delete.
     * @param {{ authorization: string | null }} context - Apollo context containing the Authorization header.
     * @returns {Promise<boolean>} True if deletion was successful.
     * @throws {Error} If unauthenticated, movie not found, or user does not own the movie.
     */
    deleteMovie: async (_, { id }, context) => {
      const userId = getAuthenticatedUserId(context.authorization);

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        throw new Error("Movie not found");
      }

      if (movie.createdBy !== userId) {
        throw new Error("You can only delete your own movies");
      }

      await prisma.movie.delete({
        where: { id },
      });

      return true;
    },
  },
};

module.exports = movieResolvers;