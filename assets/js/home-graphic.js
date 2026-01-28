// ******************** UI
const closeBtn = document.getElementById("close-rightsidebar");
const rightSidebar = document.getElementById("right-sidebar");
const mainCenter = document.getElementById("main-center");
const openBtn = document.getElementById("open-rightsidebar");

closeBtn.addEventListener("click", () => {
  rightSidebar.classList.add("d-none");
  rightSidebar.classList.remove("d-lg-flex");

  mainCenter.classList.remove("col-lg-8");
  mainCenter.classList.add("col-lg-10");

  openBtn.classList.remove("d-none");
});

openBtn.addEventListener("click", () => {
  openBtn.classList.add("d-none");

  mainCenter.classList.remove("col-lg-10");
  mainCenter.classList.add("col-lg-8");

  rightSidebar.classList.remove("d-none");
  rightSidebar.classList.add("d-lg-flex");
});

// ****************************************************************

let query = "rock classics";
const searchEndpoint = `https://striveschool-api.herokuapp.com/api/deezer/search?q=${query}`;
const albumEndpoint = "https://striveschool-api.herokuapp.com/api/deezer/album/";
const artistEndpoint = "https://striveschool-api.herokuapp.com/api/deezer/artist/";

// Query per ottenere degli elementi in base ad un search
const getElements = function () {
  return fetch(searchEndpoint)
    .then((res) => {
      console.log("Response", res);
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Errore nella response");
      }
    })
    .then((data) => {
      console.log("Elementi ricevuti", data);
      const randomIndex = Math.floor(Math.random() * data.data.length);
      console.log("Index Random =", randomIndex);
      const randomAlbumID = data.data[randomIndex].album.id;
      console.log("ID Estratto", randomAlbumID);
      return randomAlbumID;
    })
    .catch((err) => {
      console.log("Errore nella Fetch", err);
    });
};

const getMainAlbum = function (albumID) {
  const mainAlbumUrl = albumEndpoint + albumID;
  console.log(mainAlbumUrl);
  fetch(mainAlbumUrl)
    .then((res) => {
      console.log("Response", res);
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Errore nella response Main Album");
      }
    })
    .then((data) => {
      console.log("Album ricevuti", data);
      const mainAlbumCard = document.getElementById("mainAlbum-card");
      const coverImg = data.cover_big;
      const randomIndex = Math.floor(Math.random() * data.tracks.data.length);
      const titleTrack = data.tracks.data[randomIndex].title_short;
      const artistName = data.artist.name;

      mainAlbumCard.innerHTML = `
      <div class="row">
              <div class="col-4">
                <img class="img-fluid h-100" src="${coverImg}" alt="album cover" />
              </div>
              <div class="col-8 d-flex flex-column flex-nowrap">
                <div class="d-flex justify-content-between align-items-baseline">
                  <p class="fw-bold">ALBUM</p>
                  <button class="btn btn-dark rounded-pill text-muted">NASCONDI ANNUNCI</button>
                </div>
                <h1 class="display-5 fw-bold mt-1 mb-3 text-truncate">${titleTrack}</h1>
                <p>${artistName}</p>
                <p>Ascolta ora!</p>
                <div class="d-flex align-items-center gap-3 mt-4">
                  <a href="./album.html?albumId=${albumID}" class="btn btn-success fs-4 rounded-pill px-5 py-2">Play</a>
                  <button class="btn fs-4 btn-outline-light rounded-pill px-5 py-2">Salva</button>
                  <i class="bi bi-three-dots fs-2 ms-3"></i>
                </div>
              </div>
            </div>
      `;
    })
    .catch((err) => {
      console.log("Errore nella fetch Main Album", err);
    });
};

getElements()
  .then((albumID) => {
    getMainAlbum(albumID);
  })
  .catch((err) => {
    console.log("Errore", err);
  });
