/**
 * Get artist info from page URL and populate UI.
 */
const onPageLoad = async () => {
  loadArtistAndTopTracks();
};

window.addEventListener("load", onPageLoad);

let currentAudio = null;

const loadArtistAndTopTracks = async () => {
  try {
    // artist info only
    const artist = await getRemoteArtist(getArtistIdFromUrl());
    populateUIArtist(getSimplerArtistInfo(artist));

    // top tracks of this artist
    const topTracksData = await getRemoteTopTracks(artist.name);
    const filteredTracks = topTracksData.data.filter((t) => t.artist.id == artist.id).slice(0, 10);

    populateUITopTracks(getSimplerTopTracksInfo(filteredTracks));
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
};

const populateUITopTracks = (topTracks) => {
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

  playPauseBtn.onclick = togglePlay;
  mobilePlayIcon.onclick = (e) => {
    e.stopPropagation();
    togglePlay();
  };

  topTracks.forEach((track) => {
    const div = document.createElement("div");
    div.className = "track-item";
    div.innerHTML = `
      <span class="track-number fw-bold me-4">${track.num}</span>
      <img src="${track.albumCover.small}" style="width:40px;height:40px" class="rounded">
      <div class="track-info">
        <div class="track-title">${track.title}</div>
        <div class="track-artist text-white-50 small">${track.artist}</div>
      </div>
      <span class="ms-auto text-white-50 small">${track.durationForUI}</span>
    `;

    div.onclick = () => {
      playerImg.src = track.albumCover.small;
      playerImg.classList.remove("d-none");
      playerTitle.textContent = track.title;
      playerArtist.textContent = track.artist;
      playerDuration.textContent = track.durationForUI;

      mobilePlayerImg.src = track.albumCover.small;
      mobilePlayerImg.classList.remove("d-none");
      mobilePlayerTitle.textContent = track.title;
      mobilePlayerArtist.textContent = track.artist;

      if (currentAudio) currentAudio.pause();
      currentAudio = new Audio(track.preview);
      currentAudio.play();

      playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
      mobilePlayIcon.classList.replace("bi-play-fill", "bi-pause-fill");
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
    playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
    mobilePlayIcon.classList.replace("bi-play-fill", "bi-pause-fill");
  } else {
    currentAudio.pause();
    playIcon.classList.replace("bi-pause-fill", "bi-play-fill");
    mobilePlayIcon.classList.replace("bi-pause-fill", "bi-play-fill");
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
 *  Artist info:
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
      num: trackNum,
      title: track.title_short || track.title,
      artist: track.artist.name,
      durationForUI: getDurationForUI(track.duration),
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
