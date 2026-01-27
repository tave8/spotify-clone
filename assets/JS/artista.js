document.addEventListener("DOMContentLoaded", () => {
  // Recupero ID artista
  const params = new URLSearchParams(window.location.search);
  const id = params.get("artistID");

  // Variabile Audio
  let currentAudio = null;

  if (!id) return;

  // Selezione Container
  const container = document.getElementById("tracksContainer");
  container.innerHTML = '<div class="spinner-border text-success mx-auto d-block"></div>';

  // Elementi Desktop
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playIcon = document.getElementById("playIcon");
  const playerImg = document.getElementById("playerImg");
  const playerTitle = document.getElementById("playerTitle");
  const playerArtist = document.getElementById("playerArtist");
  const playerDuration = document.getElementById("playerDuration");

  // Elementi Mobile
  const mobilePlayerImg = document.getElementById("mobilePlayerImg");
  const mobilePlayerTitle = document.getElementById("mobilePlayerTitle");
  const mobilePlayerArtist = document.getElementById("mobilePlayerArtist");
  const mobilePlayIcon = document.getElementById("mobilePlayIcon");

  // Funzione Play/Pausa
  const togglePlay = () => {
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

  // Event Listeners
  playPauseBtn.addEventListener("click", togglePlay);
  mobilePlayIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // Fetch Dati
  fetch(`https://striveschool-api.herokuapp.com/api/deezer/artist/${id}`)
    .then((r) => r.json())
    .then((artist) => {
      // Popolazione Header
      document.getElementById("artistHeader").style.backgroundImage = `url(${artist.picture_big})`;
      document.getElementById("artistName").textContent = artist.name;
      document.getElementById("fansCount").textContent = artist.nb_fan.toLocaleString("it-IT") + " ascoltatori mensili";
      document.getElementById("fansCount1").textContent = artist.nb_fan.toLocaleString("it-IT") + " ascoltatori mensili";

      // Fetch Brani
      return fetch(`https://striveschool-api.herokuapp.com/api/deezer/search?q=artist:"${encodeURIComponent(artist.name)}"&limit=25`);
    })
    .then((r) => r.json())
    .then((data) => {
      // Filtro Tracce
      const tracks = data.data.filter((t) => t.artist.id == parseInt(id)).slice(0, 10);
      container.innerHTML = "";

      if (!tracks.length) {
        container.innerHTML = '<div class="text-white-50 py-4">Nessun brano trovato</div>';
        return;
      }

      // Creazione Lista
      tracks.forEach((track, i) => {
        const div = document.createElement("div");
        div.className = "track-item";
        div.innerHTML = `
            <span class="track-number fs-6 fw-bold me-4">${i + 1}</span>
            <img class=" rounded shadow-sm img-fluid object-fit-cover " src="${track.album.cover_small}" style="width: 40px; height: 40px;">
            <div class="track-info">
                <div class="track-title">${track.title_short || track.title}</div>
                <div class="track-artist text-white-50 small">${track.artist.name}</div>
            </div>
            <span class="track-duration ms-auto text-white-50 small">${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}</span>
        `;

        // Click Brano
        div.onclick = () => {
          // Aggiorna Desktop
          playerImg.src = track.album.cover_small;
          playerImg.classList.remove("d-none");
          playerTitle.textContent = track.title_short || track.title;
          playerArtist.textContent = track.artist.name;

          const minutes = Math.floor(track.duration / 60);
          const seconds = (track.duration % 60).toString().padStart(2, "0");
          playerDuration.textContent = `${minutes}:${seconds}`;

          // Aggiorna Mobile
          mobilePlayerImg.src = track.album.cover_small;
          mobilePlayerImg.classList.remove("d-none");
          mobilePlayerTitle.textContent = track.title_short || track.title;
          mobilePlayerArtist.textContent = track.artist.name;

          // Gestione Audio
          if (currentAudio) currentAudio.pause();
          currentAudio = new Audio(track.preview);
          currentAudio.play();

          // Reset Icone
          playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
          mobilePlayIcon.classList.replace("bi-play-fill", "bi-pause-fill");
        };

        container.appendChild(div);
      });
    })
    .catch((err) => {
      console.error("ERROR", err);
      container.innerHTML = `<div class="text-danger p-4">Errore: ${err.message}</div>`;
    });
});
