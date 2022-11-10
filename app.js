const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;
const initializeBbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
};
initializeBbAndServer();

const convertBdObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    moviename: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorBdObjectToResponseObject = (directorDbObject) => {
  return {
    directorId: directorDbObject.director_id,
    directorName: directorDbObject.director_name,
  };
};

//Get Movies API ---1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name AS movieName 
    FROM movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

//Add Movie API ----2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES(${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie API ----3
app.get("/movies/:movieId/", (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie 
    WHERE movie_id = ${movieId};
    `;
  const movieIs = db.get(getMovieQuery);
  response.send(convertBdObjectToResponseObject(movieIs));
});

//Update Movie API ---4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie SET 
    director_id = ${directorId}, movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API ---- 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API ---6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT director_id AS directorId, director_name AS directorName 
    FROM director;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

//Get Directors Movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsMoviesQuery = `
    SELECT movie_name AS movieName 
    FROM movie
    WHERE director_id = ${directorId};
    `;
  const moviesArray = await db.all(getDirectorsMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
