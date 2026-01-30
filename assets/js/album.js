/**
 * Get album info from page URL and populate UI.
 */

// Variabili globali per il player
let currentAudio = null;
let currentTrack = null;

const onPageLoad = async () => {
  // 1. Attiva SUBITO i bottoni del player
  setupPlayerEventListeners();

  // 2. Carica i dati dell'album
  await loadAlbumFromPageUrl();
};

// Funzione dedicata per attivare i listener del player una volta sola
const setupPlayerEventListeners = () => {
  const playPauseBtn = document.getElementById("playPauseBtn"); // Il cerchio bianco desktop
  const mobilePlayIcon = document.getElementById("mobilePlayIcon"); // Icona mobile

  // Gestione Desktop
  if (playPauseBtn) {
    playPauseBtn.onclick = (e) => {
      e.stopPropagation();
      togglePlay();
    };
  }

  // Gestione Mobile
  if (mobilePlayIcon) {
    mobilePlayIcon.onclick = (e) => {
      e.stopPropagation();
      togglePlay();
    };
  }
};

window.addEventListener("load", onPageLoad);

/**
 * Load album with given album id.
 */
const loadAlbumWithId = async (albumId) => {
  try {
    const album = await getRemoteAlbum(albumId);
    populateUIAlbum(getSimplerAlbumInfo(album));
    console.log("simpler album info: ", getSimplerAlbumInfo(album));
  } catch (err) {
    console.error(err);
  }
};

/**
 * Load album from page url (so with ?albumId=xxx in the page url)
 */
const loadAlbumFromPageUrl = async () => {
  try {
    showUIAlbumSpinners();
    showUIMoreAlbumsSpinner();

    const album = await getRemoteAlbum(getAlbumIdFromUrl());
    populateUIAlbum(getSimplerAlbumInfo(album));
    const simplerAlbum = getSimplerAlbumInfo(album);

    // Aggiugne altri 10 album diversi dai top 10 sopra elencati
    const artistAlbums = await getArtistAlbums(simplerAlbum.artistId);
    populateMoreAlbums(artistAlbums);

    // Aggiunge il nome artista a riga 147 HTML
    document.getElementById("moreAlbumsArtist").innerText = `Altro di ${simplerAlbum.artistName}`;

    console.log("simpler album info: ", getSimplerAlbumInfo(album));
  } catch (err) {
    console.error(err);
    // showUIAlbumSpinners(false);
  }
};

// Per implementare spinner negli album sotto se pagina e in loading
const getUIMoreAlbumsRow = () => {
  return document.querySelector("#moreAlbums .row");
};

const showUIAlbumSpinners = (show = true) => {
  const albumCover = getUIAlbumCover();
  const albumTitle = getUIAlbumTitle();
  const albumDuration = getUIAlbumDuration();
  const albumArtist = getUIAlbumArtist();
  const albumReleaseYear = getUIAlbumReleaseYear();
  const tracksRows = getUIAlbumTracksContainer();
  // albumCover.src = ;
  // albumTitle.innerHTML = createUISpinnerHtmlStr();
  albumDuration.innerHTML = createUISpinnerHtmlStr();
  albumArtist.innerHTML = createUISpinnerHtmlStr();
  albumReleaseYear.innerHTML = createUISpinnerHtmlStr();

  tracksRows.innerHTML = createUISpinnerHtmlStr();
};

const createUISpinnerHtmlStr = () => {
  return `
    <div class="spinner-border text-success spinner-grow-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  `;
};

const getRemoteAlbum = async (albumId) => {
  const url = `${vars.DEEZER_API_URL}/album/${albumId}`;
  const config = {};
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error("error with response. status: ", resp.status);
  }
  const data = await resp.json();
  return data;
};

/**
 * The input album should be an object simpler than
 * the API output; this wasy it's simple to access
 * the relevant properties while working with UI.
 */
const populateUIAlbum = (album) => {
  // populate only the album
  populateUIAlbumOnly(album);
  // populate only the tracks
  populateUIAlbumTracks(album);
};

// work with html here
const populateUIAlbumOnly = (album) => {
  const albumCover = getUIAlbumCover();
  const albumTitle = getUIAlbumTitle();
  const albumDuration = getUIAlbumDuration();
  const albumArtist = getUIAlbumArtist();
  const albumArtistCover = getUIAlbumArtistCover();
  const albumReleaseYear = getUIAlbumReleaseYear();

  // Riferimenti alle sezioni per lo sfondo
  const albumSection = getUIAlbumSection(); // Header
  const tracksSection = document.getElementById("tracks-section");
  // Seleziona specificamente il div dei bottoni (Play, Cuore, ecc.)
  const buttonsContainer = tracksSection ? tracksSection.querySelector(".d-flex") : null;

  albumCover.src = album.coverUrl.medium;
  albumCover.style.visibility = "visible";
  albumArtistCover.style.visibility = "visible";
  albumTitle.style.visibility = "visible";

  albumTitle.innerText = album.title;
  albumDuration.innerText = album.totalAlbumDurationForUI;
  albumArtist.innerText = album.artistName;
  albumArtistCover.src = album.artist.picture_small;
  albumArtist.href = `./artist.html?artist_id=${album.artistId}`;
  albumReleaseYear.innerText = album.releaseYear;

  // Setup bottone Play verde grande
  if (buttonsContainer) {
    const bigPlayBtn = buttonsContainer.querySelector(".btn-success");
    if (bigPlayBtn && album.tracks.length > 0) {
      bigPlayBtn.onclick = () => playTrack(album.tracks[0]);
    }
  }

  // Logica estrazione colore (come in artist.js)
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = album.coverUrl.medium;

  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");

    // Disegna img 1x1 per media colore
    ctx.drawImage(img, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    // Applica gradiente all'header (continuità)
    albumSection.style.background = `linear-gradient(to bottom, rgba(${r},${g},${b}, 0.7) 0%, rgba(${r},${g},${b}, 1) 100%)`;

    // Applica gradiente SOLO al div dei bottoni
    if (buttonsContainer) {
      buttonsContainer.style.background = `linear-gradient(to bottom, rgba(${r},${g},${b}, 1) 0%, rgba(18, 18, 18, 0) 100%)`;
      // Styling extra per rendere il gradiente gradevole nel box
      buttonsContainer.style.padding = "20px";
      buttonsContainer.style.borderRadius = "0 0 20px 20px";
      buttonsContainer.style.marginBottom = "20px";
      // Correzione margini negativi per attaccarlo visivamente all'header
      buttonsContainer.style.marginTop = "-24px";
    }
  };
};

const populateUIAlbumTracks = (album) => {
  const tracksContainer = getUIAlbumTracksContainer();
  // empty tracks rows
  tracksContainer.innerHTML = "";

  album.tracks.forEach((track) => {
    // Usiamo createElement invece di innerHTML per gestire i click
    const row = document.createElement("div");

    // Grid system aggiornato per matchare l'HTML (Mobile 12 col / Desktop 12 col)
    row.className = "row align-items-center py-2 px-3 mx-0 hover-bg-secondary rounded track-item";
    row.style.cursor = "pointer";

    // Controlla se è tra i preferiti (funzione in storage.js)
    const isLiked = typeof isSongLiked === "function" ? isSongLiked(track.id) : false;
    const heartClass = isLiked ? "bi-heart-fill text-success" : "bi-heart text-secondary";

    row.innerHTML = `
        <div class="col-1 text-secondary text-center fw-bold fs-5">${track.num}</div>
        
        <div class="col-7 col-md-5 overflow-hidden">
            <div class="text-white fw-bold text-truncate">${track.title}</div>
            <div class="text-white-50 small text-truncate">${track.artistName}</div>
        </div>
        
        <div class="col-3 text-secondary text-end small d-none d-md-block">
            ${track.rankForUI}
        </div>

        <div class="col-2 col-md-1 text-center">
             <i class="bi ${heartClass} fs-6 player-control-icon heart-btn" data-track-id="${track.id}"></i>
        </div>
        
        <div class="col-2 text-white-50 text-end small pe-4">
            ${track.durationForUI}
        </div>
    `;

    // Click sulla riga -> Play
    row.onclick = (e) => {
      if (e.target.classList.contains("heart-btn")) return;
      playTrack(track);
    };

    // Click sul cuore -> Like
    const heartBtn = row.querySelector(".heart-btn");
    heartBtn.onclick = (e) => {
      e.stopPropagation();
      const added = typeof toggleLike === "function" ? toggleLike(track) : false;

      if (added) {
        heartBtn.classList.replace("bi-heart", "bi-heart-fill");
        heartBtn.classList.replace("text-secondary", "text-success");
      } else {
        heartBtn.classList.replace("bi-heart-fill", "bi-heart");
        heartBtn.classList.replace("text-success", "text-secondary");
      }

      if (currentTrack && currentTrack.id === track.id) {
        updatePlayerHeartUI(added);
      }
    };

    tracksContainer.appendChild(row);
  });
};

// ************* LOGICA PLAYER (Play, Pause, UI Update) *************

const playTrack = (track) => {
  currentTrack = track;

  if (currentAudio) currentAudio.pause();

  if (track.preview) {
    currentAudio = new Audio(track.preview);
    currentAudio.play();
  }

  updateBottomPlayerUI(track);
  updatePlayPauseIcons(true);
};

const togglePlay = () => {
  if (!currentAudio) return;

  if (currentAudio.paused) {
    currentAudio.play();
    updatePlayPauseIcons(true);
  } else {
    currentAudio.pause();
    updatePlayPauseIcons(false);
  }
};

const updatePlayPauseIcons = (isPlaying) => {
  // Aggiorna icone play/pause ovunque (Player e Header)
  const iconsToUpdate = [
    document.getElementById("playIcon"),
    document.getElementById("mobilePlayIcon"),
    document.querySelector(".btn-success i"), // Icona bottone verde
  ];

  iconsToUpdate.forEach((icon) => {
    if (icon) {
      if (isPlaying) {
        icon.classList.replace("bi-play-fill", "bi-pause-fill");
      } else {
        icon.classList.replace("bi-pause-fill", "bi-play-fill");
      }
    }
  });
};

const updateBottomPlayerUI = (track) => {
  // Desktop
  const pImg = document.getElementById("playerImg");
  const pTitle = document.getElementById("playerTitle");
  const pArtist = document.getElementById("playerArtist");
  const pDur = document.getElementById("playerDuration");

  // Mobile
  const mImg = document.getElementById("mobilePlayerImg");
  const mTitle = document.getElementById("mobilePlayerTitle");
  const mArtist = document.getElementById("mobilePlayerArtist");

  // Update Desktop UI
  if (pImg) {
    pImg.src = track.albumCover.small;
    pImg.classList.remove("d-none");
  }
  if (pTitle) pTitle.innerText = track.title;
  if (pArtist) pArtist.innerText = track.artistName;
  if (pDur) pDur.innerText = track.durationForUI;

  // Update Mobile UI
  if (mImg) {
    mImg.src = track.albumCover.small;
    mImg.classList.remove("d-none");
  }
  if (mTitle) mTitle.innerText = track.title;
  if (mArtist) mArtist.innerText = track.artistName;

  // Setup Cuore Player
  const isLiked = typeof isSongLiked === "function" ? isSongLiked(track.id) : false;
  updatePlayerHeartUI(isLiked);

  // Listener unico per i cuori del player (desktop e mobile)
  const handlePlayerHeart = (e) => {
    e.stopPropagation();
    if (!currentTrack) return;
    const added = toggleLike(currentTrack);
    updatePlayerHeartUI(added);

    // Aggiorna anche l'icona nella lista
    const listHeart = document.querySelector(`.heart-btn[data-track-id="${currentTrack.id}"]`);
    if (listHeart) {
      if (added) {
        listHeart.classList.replace("bi-heart", "bi-heart-fill");
        listHeart.classList.replace("text-secondary", "text-success");
      } else {
        listHeart.classList.replace("bi-heart-fill", "bi-heart");
        listHeart.classList.replace("text-success", "text-secondary");
      }
    }
  };

  const pHeart = document.getElementById("playerHeart");
  const mHeart = document.getElementById("playerHeart2");
  if (pHeart) pHeart.onclick = handlePlayerHeart;
  if (mHeart) mHeart.onclick = handlePlayerHeart;
};

const updatePlayerHeartUI = (isLiked) => {
  const hearts = [document.getElementById("playerHeart"), document.getElementById("playerHeart2")];
  hearts.forEach((btn) => {
    if (btn) {
      if (isLiked) {
        btn.classList.replace("bi-heart", "bi-heart-fill");
        btn.classList.add("text-success");
        btn.classList.remove("text-secondary");
      } else {
        btn.classList.replace("bi-heart-fill", "bi-heart");
        btn.classList.remove("text-success");
        btn.classList.add("text-secondary");
      }
    }
  });
};

// ************* UI GETTERS

const getUIAlbumSection = () => {
  return document.getElementById("album-section");
};

const getUIAlbumCover = () => {
  return document.getElementById("album-cover");
};

const getUIAlbumTitle = () => {
  return document.getElementById("album-title");
};

const getUIAlbumDuration = () => {
  return document.getElementById("album-duration");
};

const getUIAlbumArtist = () => {
  return document.getElementById("album-artist");
};

const getUIAlbumArtistCover = () => {
  return document.getElementById("album-artist-cover");
};

const getUIAlbumReleaseYear = () => {
  return document.getElementById("album-release-year");
};

const getUIAlbumTracksContainer = () => {
  return document.getElementById("tracks-container");
};

// ****************************

/**
 * Outputs the album info into fields
 * that are more intuitive to access/remember.
 *
 * Album info:
 * name
 * artist
 * year
 * total tracks
 * total tracks length
 * tracks
 * total played
 * length
 */

const getSimplerAlbumInfo = (album) => {
  const title = album.title;
  const artistName = album.artist.name;
  const artistId = album.artist.id;
  const releaseYear = helpers.getYearFromDate(album.release_date);
  const coverUrl = {
    big: album.cover_big,
    medium: album.cover_medium,
    small: album.cover_small,
    xl: album.cover_xl,
  };
  const totalTracks = album.nb_tracks;
  const totalTracksDurationSec = album.duration;
  // 53 min 20 sec.
  const totalAlbumDurationForUI = helpers.getAlbumDurationForUI(totalTracksDurationSec);

  let trackNum = 0;
  const tracks = album.tracks.data.map((track) => {
    trackNum += 1;
    return {
      // Dati necessari per il player e il like
      id: track.id,
      num: trackNum,
      title: track.title,

      // --- FIX IMPORTANTE PER I LIKE ---
      // Aggiungiamo 'artist' perché storage.js/artist.html usano questa chiave
      artist: track.artist.name,

      artistName: track.artist.name,
      // artist.js si aspetta di trovare song.album.cover_small o simili per la lista
      album: {
        id: album.id,
        title: album.title,
        cover: album.cover_medium,
        cover_small: album.cover_small,
        cover_medium: album.cover_medium,
        cover_big: album.cover_big,
        cover_xl: album.cover_xl,
      },

      rank: track.rank,
      rankForUI: helpers.getTrackRankForUI(track.rank),
      // 3:54
      durationForUI: helpers.getTrackDurationForUI(track.duration),
      preview: track.preview, // Audio
      albumCover: coverUrl, // Passiamo l'oggetto cover completo
    };
  });

  return {
    // Gioventù brucata
    title,
    // {small, big, etc.}
    coverUrl,
    // Pinguini Tattici Nuclear
    artistName,
    // 393454
    artistId,
    artist: album.artist,
    // 2017
    releaseYear,
    // 12
    totalTracks,
    // 53 min 20 sec.
    totalAlbumDurationForUI,
    // [track]
    tracks,
  };
};

const getAlbumIdFromUrl = () => {
  return helpers.getUrlQueryParam(vars.ALBUM_ID_QUERY_PARAM);
};

const getArtistAlbums = async (artistId) => {
  const url = `${vars.DEEZER_API_URL}/artist/${artistId}/albums`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Errore fetch artist albums");
  const data = await resp.json();
  return data.data;
};

// Implemento spinner per gli altri 10 spinner sotto
const showUIMoreAlbumsSpinner = () => {
  const row = getUIMoreAlbumsRow();
  row.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    row.innerHTML += `
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

const populateMoreAlbums = (albums) => {
  const row = document.querySelector("#moreAlbums .row");
  row.innerHTML = "";

  const moreTen = albums.slice(10, 15);

  moreTen.forEach((album) => {
    row.innerHTML += `
      <div class="col">
        <a href="./album.html?album_id=${album.id}" class="text-decoration-none">
          <div class="card bg-dark border-0 h-100 album-card-hover animated">
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
