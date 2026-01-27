document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("artistID");
  console.log("ID:", id);

  if (!id) {
    document.getElementById("tracksContainer").innerHTML = '<div class="text-danger p-4"></div>';
    return;
  }

  const container = document.getElementById("tracksContainer");
  container.innerHTML = '<div class="spinner-border text-success mx-auto d-block"></div>';

  fetch(`https://striveschool-api.herokuapp.com/api/deezer/artist/${id}`)
    .then((r) => r.json())
    .then((artist) => {
      console.log(" Artista:", artist.name);
      document.getElementById("artistHeader").style.backgroundImage = `url(${artist.picture_big})`;
      document.getElementById("artistName").textContent = artist.name;
      document.getElementById("fansCount").textContent = artist.nb_fan.toLocaleString("it-IT") + " ascoltatori mensili";

      // Ricerca per artista
      return fetch(`https://striveschool-api.herokuapp.com/api/deezer/search?q=artist:"${encodeURIComponent(artist.name)}"&limit=25`);
    })
    .then((r) => r.json())
    .then((data) => {
      console.log("Risultati ricerca:", data.data.length);
      const tracks = data.data.filter((t) => t.artist.id == parseInt(id)).slice(0, 10);
      console.log("Tracks filtrati:", tracks.length);

      container.innerHTML = "";
      if (!tracks.length) {
        container.innerHTML = '<div class="text-white-50 py-4">Nessun brano trovato</div>';
        return;
      }

      tracks.forEach((track, i) => {
        const div = document.createElement("div");
        div.className = "track-item";
        div.innerHTML = `
<span class="track-number fs-6 fw-bold me-4">${i + 1}</span>
<img class=" rounded shadow-sm img-fluid object-fit-cover " src="${track.album.cover_small}">
<div class="track-info">
<div class="track-title">${track.title_short || track.title}</div>
<div class="track-artist text-white-50 small">${track.artist.name}</div>
</div>
<span class="track-duration ms-auto text-white-50 small">${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}</span>
`;
        div.onclick = () => alert(` ${track.title}`);
        container.appendChild(div);
      });
    })
    .catch((err) => {
      console.error("ERROR", err);
      container.innerHTML = `<div class="text-danger p-4">Errore: ${err.message}</div>`;
    });
});
