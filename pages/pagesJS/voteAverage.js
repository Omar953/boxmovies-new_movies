

const TopRatedMovies = (function() {
  let currentPage = 1;
  const apiKey = 'bd27fabd4f448617eb4ef4dd33c7b66a';
  const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en&sort_by=vote_count.desc&page=10`;
  const maxMoviesPerPage = 17;
  let moviesList;

  function fetchMovies(page) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + page);
    xhr.send();
    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        moviesList = JSON.parse(xhr.response).results;
        displayMovies();
      }
    });
  }

  function displayMovies() {
    let container = "";
    for (let i = 0; i < Math.min(moviesList.length, maxMoviesPerPage); i++) {
      container += `
            <div class="div-card w-100">  
              <a href="https://omar953.github.io/boxmovies-page_movie/" class="btn-top-rated" data-top-rated-index="${i}">
                <img src="https://image.tmdb.org/t/p/w500/${moviesList[i].poster_path}" class="w-100">
              </a>
              <h5>${moviesList[i].title}</h5>
              <hr>
              <span class="span-star">${Number(moviesList[i].vote_average.toFixed(1))} <i class="fa-solid fa-star star"></i></span>
              <span>${moviesList[i].release_date.slice(0, 4)}</span>
              <p class="span-eye">${moviesList[i].popularity} <i class="fa-solid fa-eye eye"></i></p>
            </div>
    `;
    }
    document.getElementById("voteAverage").innerHTML = container;
    attachTrailerEvents();
  }

  function fetchYouTubeTrailer(movieId, callback) {
    const videoApiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en`;
    fetch(videoApiUrl)
      .then((response) => response.json())
      .then((data) => {
        let video = data.results.find((video) => video.type === "Trailer" && video.site === "YouTube");
        if (!video) {
          video = data.results.find((video) => video.type === "Teaser" && video.site === "YouTube");
        }
        if (video) {
          const videoUrl = `https://www.youtube.com/embed/${video.key}`;
          callback(videoUrl);
        } else {
          console.log("No trailer or teaser found for this movie.");
          callback(null);
        }
      })
      .catch((error) => console.error("Error fetching video:", error));
  }

  function saveMovieToLocalStorage(movie, videoUrl) {
    localStorage.setItem("poster", movie.poster_path);
    localStorage.setItem("backdrop_path", movie.backdrop_path);
    localStorage.setItem("title", movie.title);
    localStorage.setItem("original_title", movie.original_title);
    localStorage.setItem("overview", movie.overview);
    localStorage.setItem("popularity", movie.popularity);
    localStorage.setItem("average", Number(movie.vote_average.toFixed(1)));
    localStorage.setItem("release_date", movie.release_date);
    localStorage.setItem("id", movie.id);
    if (videoUrl) {
      localStorage.setItem("video_src2", videoUrl);
      sessionStorage.setItem("video_src2", videoUrl);
    }
    console.log("Top rated movie data stored:", movie);
  }

  function attachTrailerEvents() {
    const films = document.querySelectorAll(".btn-top-rated");
    films.forEach((film) => {
      film.addEventListener("click", function (event) {
        event.preventDefault();
        const index = this.getAttribute("data-top-rated-index");
        const movie = moviesList[index];
        if (movie) {
          fetchYouTubeTrailer(movie.id, (videoUrl) => {
            saveMovieToLocalStorage(movie, videoUrl);
            window.location.href = "https://omar953.github.io/boxmovies-page_movie/";
          });
        } else {
          console.log("Top rated movie not found in the list.");
        }
      });
    });
  }

  document.getElementById('nextvoteAverageButton').addEventListener('click', function () {
    currentPage++;
    fetchMovies(currentPage);
  });

  fetchMovies(currentPage);

  return {
    fetchMovies: fetchMovies
  };
})();
