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

let query = "rock";
const searchEndpoint = `https://striveschool-api.herokuapp.com/api/deezer/search?q=${query}`;
const albumEndpoint = "https://striveschool-api.herokuapp.com/api/deezer/album/";
const artistEndpoint = "https://striveschool-api.herokuapp.com/api/deezer/artist/";

// Query per ottenere degli elementi in base ad un search
const getElements = function () {
  return fetch(searchEndpoint)
    .then((res) => {
      console.log("Response query", res);
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
      console.log("Album ID Estratto", randomAlbumID);
      const IDs = [randomAlbumID, data.data];
      console.log(IDs);
      return IDs;
    })
    .catch((err) => {
      console.log("Errore nella Fetch", err);
    });
};

const getMainAlbum = function (albumID) {
  const mainAlbumUrl = albumEndpoint + albumID[0];
  console.log("Album URL:", mainAlbumUrl);
  fetch(mainAlbumUrl)
    .then((res) => {
      console.log("Response mainAlbum", res);
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
      const albumName = data.title;
      const artistImg = data.artist.picture_small;
      const artistID = data.artist.id;

      mainAlbumCard.innerHTML = `
      <div class="row">
              <div class="col-4">
                <img class="img-fluid h-100" src="${coverImg}" alt="album cover" />
              </div>
              <div class="col-8 d-flex flex-column justify-content-between flex-nowrap">
                <div class="d-flex justify-content-between align-items-baseline">
                  <p class="fw-bold">ALBUM</p>
                  <button class="btn btn-dark rounded-pill text-muted">NASCONDI ANNUNCI</button>
                </div>
                <h1 class="display-5 fw-bold mt-1 mb-3 text-truncate">${albumName}</h1>
                <p>Song: ${titleTrack}</p>
                <a href="./artist.html?artist_id=${artistID}" class="d-flex align-items-center gap-2 text-light text-decoration-none pointer"><span><img src="${artistImg}" alt="artist-image" width="30" class="rounded-circle"></span> ${artistName}</a>
                <div class="d-flex align-items-center gap-3 mt-4">
                  <a href="./album.html?album_id=${albumID[0]}" class="btn btn-success fs-4 rounded-pill px-5 py-2">Play</a>
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

const getArtist = function (elementList) {
  console.log("element Artistlist", elementList);
  const everyCard = document.querySelectorAll("#categories-container > div");
  console.log("Card", everyCard);
  const usedArtists = [];

  everyCard.forEach((card) => {
    let artist;
    let attempts = 0;

    while (!artist || usedArtists.includes(artist.id)) {
      const randomIndex = Math.floor(Math.random() * elementList.length);
      artist = elementList[randomIndex].artist;
      attempts++;

      if (attempts > elementList.length) return;
    }

    usedArtists.push(artist.id);

    const artistImg = artist.picture_medium;
    const artistName = artist.name;

    card.innerHTML = `
      
                <a href="./artist.html?artist_id=${artist.id}" class="text-decoration-none text-light d-flex align-items-center rounded-2 bg-gradient">
                    <img src="${artistImg}" alt="" width="75" class="rounded-2" />
                    <p class="ms-2 mb-0">${artistName}</p>
                </a>

        `;
  });
};

const getAlbums = function (elementList) {
  const everyAlbumCard = document.querySelectorAll("#playlist-container > div");
  console.log("Albums", everyAlbumCard);
  const usedAlbmus = [];

  everyAlbumCard.forEach((card) => {
    let album;
    let attempts = 0;

    while (!album || usedAlbmus.includes(album.id)) {
      const randomIndex = Math.floor(Math.random() * elementList.length);
      album = elementList[randomIndex].album;
      attempts++;

      if (attempts > elementList.length) return;
    }

    usedAlbmus.push(album.id);

    let albumImg = album.cover_big;
    let albumTitle = album.title;
    let type = "Playlist";

    // if (album.type === "album") {
    //   type = "Playlist";
    // } else {
    //   type = "Artist";
    // }

    card.innerHTML = `
    <div class="bg-gradient rounded-2 p-3 p-lg-0 h-100">
      <a href="./album.html?album_id=${album.id}" class="text-light text-decoration-none">
                    <div class="row d-lg-block g-3 g-lg-3">
                      <div class="col-6 col-lg-12">
                        <img src="${albumImg}" alt="album cover" class="img-fluid w-100 rounded-start" />
                      </div>
                      <div class="col-6 d-flex flex-column col-lg-12 px-lg-3 py-lg-1">
                        <p class="d-inline">${type}</p>
                        <h4 class="d-inline">${albumTitle}</h4>
                      </div>
                    </div>
                    <div class="d-flex d-lg-none justify-content-between align-items-center fs-2 my-3">
                      <div class="d-flex align-items-center gap-5 gap-md-3 gap-lg-2">
                        <i class="bi bi-heart-fill text-success"></i>
                        <i class="bi bi-three-dots-vertical text-muted"></i>
                      </div>
                      <div class="d-flex align-items-center gap-3">
                        <p class="mb-0 fs-6 text-muted">8 brani</p>
                        <i class="bi bi-play-circle-fill fs-1 text-muted"></i>
                      </div>
                    </div>
        </a>
    </div>
    `;
  });

  const spinner = document.getElementById("playlist-spinner");
  spinner.classList.add("d-none");
};

getElements()
  .then((IDs) => {
    getMainAlbum(IDs);
    getArtist(IDs[1]);
    getAlbums(IDs[1]);
  })
  .catch((err) => {
    console.log("Errore", err);
  });

// ****************************************************************
// NAVIGAZIONE (Frecce Indietro/Avanti)
// ****************************************************************

const setupNavigation = () => {
  const btnBack = document.getElementById("btn-back");
  const btnForward = document.getElementById("btn-forward");

  if (btnBack) {
    btnBack.onclick = () => window.history.back();
  }

  if (btnForward) {
    btnForward.onclick = () => window.history.forward();
  }
};

// Avvia la funzione
setupNavigation();
