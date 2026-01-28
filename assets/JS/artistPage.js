/**
 * Get artist info from page URL and populate UI.
 */
const onPageLoad = async () => {
  loadArtistAndTopTracks();
};

window.addEventListener("load", onPageLoad);

let currentAudio = null;

// NUOVO: Funzione centralizzata per aggiornare la sezione "Brani che ti piacciono"
const updateLikedSection = (artistName, artistImage) => {
  const count = getCountOfLikedSongs(artistName); // Funzione da storage.js
  const section = document.getElementById("likedTracks");
  const container = document.getElementById("likedTracksContainer");

  if (count > 0) {
    section.classList.remove("d-none"); // Mostra la sezione

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
    section.classList.add("d-none"); // Nascondi se non ci sono like
  }
};

const loadArtistAndTopTracks = async () => {
  try {
    // artist info only
    const artistRaw = await getRemoteArtist(getArtistIdFromUrl());
    const artist = getSimplerArtistInfo(artistRaw);
    populateUIArtist(artist);

    // top tracks of this artist
    const topTracksData = await getRemoteTopTracks(artist.name);
    const filteredTracks = topTracksData.data.filter((t) => t.artist.id == artistRaw.id).slice(0, 10);

    // NUOVO: Passiamo anche l'immagine piccola dell'artista per la sezione Like
    populateUITopTracks(getSimplerTopTracksInfo(filteredTracks), artist.picture.small);
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
const populateUIArtist = (artist) => {
  // continue here: populate the UI with artist
  // and its info/tracks

  document.getElementById("artistHeader").style.backgroundImage = `url(${artist.picture.big})`;

  document.getElementById("artistName").textContent = artist.name;

  document.getElementById("fansCount").textContent = artist.totalFans.toLocaleString("it-IT") + " ascoltatori mensili";

  document.getElementById("fansCount1").textContent = artist.totalFans.toLocaleString("it-IT") + " ascoltatori mensili";

  // NUOVO: Inizializziamo la sezione "Mi piace" appena caricata la pagina
  updateLikedSection(artist.name, artist.picture.small);
};

const populateUITopTracks = (topTracks, artistSmallImage) => {
  // continue here: populate the top tracks UI

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

  topTracks.forEach((track) => {
    const div = document.createElement("div");
    // NUOVO: Aggiunte classi flex per layout ordinato
    div.className = "track-item d-flex align-items-center justify-content-between p-2";

    // NUOVO: Controllo stato iniziale del cuore
    const isLiked = typeof isSongLiked === "function" ? isSongLiked(track.id) : false;
    const heartIconClass = isLiked ? "bi-heart-fill text-success" : "bi-heart";

    div.innerHTML = `
      <div class="d-flex align-items-center flex-grow-1 overflow-hidden">
        <span class="track-number fw-bold me-3 text-secondary" style="width: 20px;">${track.num}</span>
        <img src="${track.albumCover.small}" style="width:40px;height:40px" class="rounded me-3 flex-shrink-0">
        
        <div class="track-info overflow-hidden"> 
            <div class="track-title text-white fw-bold text-truncate">${track.title}</div>
            <div class="track-artist text-white-50 small text-truncate">${track.artist}</div>
        </div>
      </div>

      <div class="d-flex align-items-center flex-shrink-0">
         <i class="bi ${heartIconClass} fs-5 me-4 heart-btn" style="cursor: pointer; z-index: 10;"></i>
         <span class="text-white-50 small" style="min-width: 40px; text-align: right;">${track.durationForUI}</span>
      </div>
    `;

    const heartBtn = div.querySelector(".heart-btn");

    // NUOVO: Gestione click sul cuore
    heartBtn.onclick = (e) => {
      e.stopPropagation(); // Ferma il click (non fa partire la canzone)

      const songObj = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover: track.albumCover.small,
        duration: track.duration,
        preview: track.preview,
      };

      const added = toggleLike(songObj); // Chiama storage.js

      // NUOVO: Aggiorna icona visivamente
      if (added) {
        heartBtn.classList.remove("bi-heart");
        heartBtn.classList.add("bi-heart-fill", "text-success");
      } else {
        heartBtn.classList.remove("bi-heart-fill", "text-success");
        heartBtn.classList.add("bi-heart");
      }

      // NUOVO: Aggiorna la sezione "Brani che ti piacciono" in tempo reale
      updateLikedSection(track.artist, artistSmallImage);
    };

    div.onclick = () => {
      // populate player logic
      if (playerImg) {
        playerImg.src = track.albumCover.small;
        playerImg.classList.remove("d-none");
      }
      if (playerTitle) playerTitle.textContent = track.title;
      if (playerArtist) playerArtist.textContent = track.artist;
      if (playerDuration) playerDuration.textContent = track.durationForUI;

      if (mobilePlayerImg) {
        mobilePlayerImg.src = track.albumCover.small;
        mobilePlayerImg.classList.remove("d-none");
      }
      if (mobilePlayerTitle) mobilePlayerTitle.textContent = track.title;
      if (mobilePlayerArtist) mobilePlayerArtist.textContent = track.artist;

      if (currentAudio) currentAudio.pause();
      if (track.preview) {
        currentAudio = new Audio(track.preview);
        currentAudio.play();

        if (playIcon) playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
        if (mobilePlayIcon) mobilePlayIcon.classList.replace("bi-play-fill", "bi-pause-fill");
      }
      const playerBtnHeart = document.getElementById("playerHeart");
      playerBtnHeart.addEventListener("click", () => {});
    };

    container.appendChild(div);
  });
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
  return params.get("artistID");
};
