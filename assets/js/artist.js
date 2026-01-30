/*
 * Get artist info from page URL and populate UI.
 */
const onPageLoad = async () => {
  await loadArtistAndTopTracks();
};

window.addEventListener("load", onPageLoad);

let currentAudio = null;
let currentTrack = null;

// NUOVO: Funzione centralizzata per aggiornare la sezione "Brani che ti piacciono"
const updateLikedSection = (artistName, artistImage) => {
  const count = getCountOfLikedSongs(artistName); // Funzione da storage.js
  const section = document.getElementById("likedTracks");
  const container = document.getElementById("likedTracksContainer");
  const popularTracksCont = document.getElementById("popularTracks");

  if (count > 0) {
    // Mostra la sezione
    section.classList.remove("d-none");
    section.classList.remove("d-md-none");
    popularTracksCont.classList.remove("col-12"); // ripristina col-md-8
    popularTracksCont.classList.add("col-md-8");

    // NUOVO: Generiamo l'HTML con l'immagine dell'artista e il conteggio
    container.innerHTML = `
<div class="d-flex align-items-center p-3">
<div class="position-relative">
<img src="${artistImage}" class="rounded-circle" style="width: 50px; height: 50px; object-fit: cover;">
<div class="bg-success rounded-circle position-absolute bottom-0 end-0 d-flex justify-content-center align-items-center p-1" style="width: 20px; height: 20px;">
<i class="bi bi-heart-fill text-white" style="font-size: 10px;"></i>
</div>
</div>
<div class="ms-3">
<div class="fw-bold text-white">Hai messo "Mi piace" a ${count} brani</div>
<div class="text-white-50 small">di ${artistName}</div>
</div>
</div>
`;
  } else {
    // Nascondi sezione liked e allarga i top tracks
    section.classList.add("d-none");
    section.classList.add("d-md-none");
    popularTracksCont.classList.remove("col-md-8");
    popularTracksCont.classList.add("col-12");
    container.innerHTML = "";
  }
};

// Mostra spinner per Top Tracks e Altri Album
const showLoadingState = () => {
  const tracksContainer = document.getElementById("tracksContainer");
  const moreAlbumsRow = document.querySelector("#moreAlbums .row");

  tracksContainer.innerHTML = `
    <div class="d-flex justify-content-center p-4">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;

  moreAlbumsRow.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    moreAlbumsRow.innerHTML += `
      <div class="col">
        <div class="card bg-dark border-0">
          <div class="placeholder-glow">
            <div class="placeholder col-12 mb-2" style="height:160px;"></div>
            <div class="placeholder col-8"></div>
          </div>
        </div>
      </div>
    `;
  }
};

const loadArtistAndTopTracks = async () => {
  try {
    showLoadingState(); // Mostra spinner

    // artist info only
    const artistRaw = await getRemoteArtist(getArtistIdFromUrl());
    const artist = getSimplerArtistInfo(artistRaw);
    populateUIArtist(artist);

    // top tracks of this artist
    const topTracksData = await getRemoteTopTracks(artist.name);
    const filteredTracks = topTracksData.data.filter((t) => t.artist.id == artistRaw.id).slice(0, 10);

    // NUOVO: Passiamo anche l'immagine piccola dell'artista per la sezione Like
    populateUITopTracks(getSimplerTopTracksInfo(filteredTracks), artist.picture.small);

    // Carica altri album
    const artistAlbums = await getArtistAlbums(artistRaw.id);
    populateMoreAlbums(artistAlbums);
    document.getElementById("moreAlbumsArtist").innerText = `Altri album di ${artist.name}`;
  } catch (err) {
    console.error(err);
    document.getElementById("tracksContainer").innerHTML = `<div class="text-danger p-4">Errore: ${err.message}</div>`;
  }
};

/**
 * The artist album should be an object simpler than
 * the API output; this wasy it's simple to access
 * the relevant properties while working with UI.
 */
/**
 * The artist album should be an object simpler than
 * the API output; this wasy it's simple to access
 * the relevant properties while working with UI.
 */
/**
 * Popola la UI con info artista e calcola il colore medio per lo sfondo
 */
/**
 * Popola la UI con info artista e crea un gradiente continuo tra Header e Info
 */
const populateUIArtist = (artist) => {
  // 1. Dati testuali
  document.getElementById("artistName").textContent = artist.name;
  document.getElementById("fansCount").textContent = artist.totalFans.toLocaleString("it-IT") + " ascoltatori mensili";
  document.getElementById("fansCount1").textContent = artist.totalFans.toLocaleString("it-IT") + " ascoltatori mensili";

  // 2. RIFERIMENTI DOM
  const header = document.getElementById("artistHeader");
  const infoSection = document.getElementById("infoArtist"); // L'ID corretto dal tuo HTML

  // Fallback iniziale (solo immagine)
  header.style.backgroundImage = `url(${artist.picture.big})`;
  header.style.backgroundSize = "cover";
  header.style.backgroundPosition = "center";

  // 3. CALCOLO COLORE (Canvas Trick)
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = artist.picture.big;

  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");

    // Disegniamo l'immagine in 1x1 pixel per la media
    ctx.drawImage(img, 0, 0, 1, 1);

    // Estraiamo RGB
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    // --- APPLICAZIONE GRADIENTI ---

    // A. HEADER: Immagine di sfondo che sfuma verso il colore in basso
    // (rgba con opacità 0.8 alla fine per fondersi con la sezione sotto)
    header.style.background = `
linear-gradient(to bottom, transparent 0%, rgba(${r},${g},${b}, 0.8) 100%),
url(${artist.picture.big})
`;
    header.style.backgroundSize = "cover";
    header.style.backgroundPosition = "center 20%"; // Centrato leggermente in alto

    // B. SECTION INFO: Parte dal colore (0.8) e sfuma a nero (#121212)
    // Questo crea l'effetto "continuo" stile Spotify
    infoSection.style.background = `linear-gradient(to bottom, rgba(${r},${g},${b}, 0.8) 0%, #121212 100%)`;
  };

  // 4. Inizializza la sezione "Mi piace"
  updateLikedSection(artist.name, artist.picture.small);
};

const populateUITopTracks = (topTracks, artistSmallImage) => {
  const container = document.getElementById("tracksContainer");
  container.innerHTML = "";

  const playPauseBtn = document.getElementById("playPauseBtn");
  const playIcon = document.getElementById("playIcon");
  const mobilePlayIcon = document.getElementById("mobilePlayIcon");

  const playerImg = document.getElementById("playerImg");
  const playerTitle = document.getElementById("playerTitle");
  const playerArtist = document.getElementById("playerArtist");
  const playerDuration = document.getElementById("playerDuration");

  const mobilePlayerImg = document.getElementById("mobilePlayerImg");
  const mobilePlayerTitle = document.getElementById("mobilePlayerTitle");
  const mobilePlayerArtist = document.getElementById("mobilePlayerArtist");

  if (playPauseBtn) playPauseBtn.onclick = togglePlay;
  if (mobilePlayIcon)
    mobilePlayIcon.onclick = (e) => {
      e.stopPropagation();
      togglePlay();
    };

  // === NUOVO: SELEZIONE ENTRAMBI I CUORI ===
  const playerBtnHeart = document.getElementById("playerHeart");
  const playerBtnHeart2 = document.getElementById("playerHeart2"); // Cuore mobile

  // Funzione helper per aggiornare visivamente TUTTI i cuori del player
  const updatePlayerHearts = (isLiked) => {
    [playerBtnHeart, playerBtnHeart2].forEach((btn) => {
      if (btn) {
        if (isLiked) {
          btn.classList.replace("bi-heart", "bi-heart-fill");
          btn.classList.add("text-success");
        } else {
          btn.classList.replace("bi-heart-fill", "bi-heart");
          btn.classList.remove("text-success");
        }
      }
    });
  };

  // Listener unico per il click sui cuori del player (Desktop o Mobile)
  const handlePlayerHeartClick = (e) => {
    e.stopPropagation();
    if (!currentTrack) return;

    const added = toggleLike(currentTrack);

    // 1. Aggiorna le icone nella lista brani
    document.querySelectorAll(".heart-btn").forEach((btn) => {
      if (btn.dataset.trackId == currentTrack.id) {
        if (added) {
          btn.classList.replace("bi-heart", "bi-heart-fill");
          btn.classList.add("text-success");
        } else {
          btn.classList.replace("bi-heart-fill", "bi-heart");
          btn.classList.remove("text-success");
        }
      }
    });

    // 2. Aggiorna entrambi i cuori del player
    updatePlayerHearts(added);

    // 3. Aggiorna la sezione in alto
    updateLikedSection(currentTrack.artist, artistSmallImage);
  };

  // Assegna il listener a entrambi i pulsanti (se esistono nella pagina)
  if (playerBtnHeart) playerBtnHeart.onclick = handlePlayerHeartClick;
  if (playerBtnHeart2) playerBtnHeart2.onclick = handlePlayerHeartClick;

  // === GENERAZIONE LISTA BRANI ===
  topTracks.forEach((track) => {
    const div = document.createElement("div");
    div.className = "track-item d-flex align-items-center justify-content-between p-2";

    const isLiked = typeof isSongLiked === "function" ? isSongLiked(track.id) : false;
    const heartIconClass = isLiked ? "bi-heart-fill text-success" : "bi-heart";

    div.innerHTML = `
      <div class="d-flex align-items-center flex-grow-1 overflow-hidden">
        <span class="track-number fs-5 fw-bold me-3 text-secondary" style="width: 20px;">${track.num}</span>
        <img src="${track.albumCover.small}" style="width:40px;height:40px" class="rounded me-3 flex-shrink-0">
        <div class="track-info overflow-hidden"> 
            <div class="track-title text-white fw-bold text-truncate">${track.title}</div>
            <div class="track-artist text-white-50 small text-truncate">${track.artist}</div>
        </div>
      </div>
      
      <div class="d-flex align-items-center flex-shrink-0 pe-3">
         <span class="text-white-50 small d-none d-md-flex" style="min-width: 40px; text-align: right;">${track.rankForUI}</span>
      </div>

      <div class="d-flex align-items-center flex-shrink-0">
         <i class="bi ${heartIconClass} fs-5 me-4 heart-btn" style="cursor: pointer; z-index: 10;" data-track-id="${track.id}"></i>
         <span class="text-white-50 small" style="min-width: 40px; text-align: right;">${track.durationForUI}</span>
      </div>
    `;

    // GESTIONE CLICK CUORE NELLA LISTA
    const heartBtn = div.querySelector(".heart-btn");
    heartBtn.onclick = (e) => {
      e.stopPropagation();

      const added = toggleLike(track); // Usa 'track' direttamente per evitare confusione

      // Aggiorna icona riga
      if (added) {
        heartBtn.classList.replace("bi-heart", "bi-heart-fill");
        heartBtn.classList.add("text-success");
      } else {
        heartBtn.classList.replace("bi-heart-fill", "bi-heart");
        heartBtn.classList.remove("text-success");
      }

      // Se la canzone a cui ho messo like è quella attualmente nel player, aggiorna i cuori del player
      if (currentTrack && currentTrack.id === track.id) {
        updatePlayerHearts(added);
      }

      updateLikedSection(track.artist, artistSmallImage);
    };

    // GESTIONE CLICK PLAY SULLA RIGA
    div.onclick = () => {
      currentTrack = { ...track };

      // Popola UI Desktop
      if (playerImg) {
        playerImg.src = track.albumCover.small;
        playerImg.classList.remove("d-none");
      }
      if (playerTitle) playerTitle.textContent = track.title;
      if (playerArtist) playerArtist.textContent = track.artist;
      if (playerDuration) playerDuration.textContent = track.durationForUI;

      // Popola UI Mobile
      if (mobilePlayerImg) {
        mobilePlayerImg.src = track.albumCover.small;
        mobilePlayerImg.classList.remove("d-none");
      }
      if (mobilePlayerTitle) mobilePlayerTitle.textContent = track.title;
      if (mobilePlayerArtist) mobilePlayerArtist.textContent = track.artist;

      // Gestione Audio
      if (currentAudio) currentAudio.pause();
      if (track.preview) {
        currentAudio = new Audio(track.preview);
        currentAudio.play();
        if (playIcon) playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
        if (mobilePlayIcon) mobilePlayIcon.classList.replace("bi-play-fill", "bi-pause-fill");
      }

      // Aggiorna lo stato dei cuori del player appena parte la canzone
      const isLikedNow = isSongLiked(track.id);
      updatePlayerHearts(isLikedNow);
    };

    container.appendChild(div);
  });

  // TASTO VERDE "PLAY" IN ALTO
  const playArtistBtn = document.getElementById("playTracksArtist");
  const firstTrackRow = container.querySelector(".track-item");
  if (playArtistBtn && firstTrackRow) {
    playArtistBtn.onclick = () => {
      firstTrackRow.click();
    };
  }
};

const togglePlay = () => {
  const playIcon = document.getElementById("playIcon");
  const mobilePlayIcon = document.getElementById("mobilePlayIcon");

  if (!currentAudio) return;

  if (currentAudio.paused) {
    currentAudio.play();
    if (playIcon) playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
    if (mobilePlayIcon) mobilePlayIcon.classList.replace("bi-play-fill", "bi-pause-fill");
  } else {
    currentAudio.pause();
    if (playIcon) playIcon.classList.replace("bi-pause-fill", "bi-play-fill");
    if (mobilePlayIcon) mobilePlayIcon.classList.replace("bi-pause-fill", "bi-play-fill");
  }
};

const getRemoteArtist = async (artistId) => {
  const url = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}`;
  const config = {};
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error("error with response. status: ", resp.status);
  }
  const data = await resp.json();
  return data;
};

const getRemoteTopTracks = async (artistName) => {
  const url = `https://striveschool-api.herokuapp.com/api/deezer/search?q=artist:"${encodeURIComponent(artistName)}"&limit=25`;
  const config = {};
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error("error with response. status: ", resp.status);
  }
  const data = await resp.json();
  return data;
};

/**
* Outputs the artist info into fields
* that are more intuitive to access/remember.
*
* Artist info:
name
total listeners
popular
*/
const getSimplerArtistInfo = (artist) => {
  const name = artist.name;
  const picture = {
    small: artist.picture_small,
    medium: artist.picture_medium,
    big: artist.picture_big,
    xl: artist.picture_xl,
  };
  const totalFans = artist.nb_fan;

  return {
    name,
    picture,
    totalFans,
  };
};

const getSimplerTopTracksInfo = (topTracks) => {
  let trackNum = 0;
  return topTracks.map((track) => {
    trackNum += 1;
    return {
      id: track.id, // NUOVO: Fondamentale per il like
      num: trackNum,
      title: track.title_short || track.title,
      artist: track.artist.name,
      durationForUI: getDurationForUI(track.duration),
      duration: track.duration, // NUOVO: Serve per l'oggetto like
      preview: track.preview,
      rankForUI: getRankForUI(track.rank),
      albumCover: {
        big: track.album.cover_big,
        medium: track.album.cover_medium,
        small: track.album.cover_small,
        xl: track.album.cover_xl,
      },
    };
  });
};

const getDurationForUI = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const getArtistIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("artist_id");
};

const getRankForUI = function (rankNum) {
  return rankNum.toLocaleString("it-IT");
};

// Recupera tutti gli album di un artista
const getArtistAlbums = async (artistId) => {
  try {
    const url = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}/albums`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Errore fetch artist albums. Status: " + resp.status);
    const data = await resp.json();
    return data.data; // Restituisce solo l'array di album
  } catch (err) {
    console.error(err);
    return []; // Fallback vuoto
  }
};

// Popola la sezione "Altri album" di un artista
const populateMoreAlbums = (albums) => {
  const row = document.querySelector("#moreAlbums .row");
  row.innerHTML = "";

  // Prendiamo solo i primi 5 album per evitare troppi elementi
  const albumsToShow = albums.slice(0, 5);

  albumsToShow.forEach((album) => {
    row.innerHTML += `
      <div class="col">
        <a href="./album.html?album_id=${album.id}" class="text-decoration-none">
          <div class="card border-0 h-100 animated pointer">
            <img 
              src="${album.cover_medium}" 
              class="card-img-top" 
              alt="${album.title}"
            >
            <div class="card-body px-0">
              <p class="card-title text-white small fw-bold mb-0 px-3 text-truncate">
                ${album.title}
              </p>
              <p class="text-secondary small text-start px-3">Album</p>
            </div>
          </div>
        </a>
      </div>
    `;
  });
};
