const STORAGE_KEY = "spotify_favorites_list";

// LEGGE I PREFERITI
function getFavorites() {
  const storedString = localStorage.getItem(STORAGE_KEY);
  if (storedString) {
    return JSON.parse(storedString); // Trasforma la stringa in array
  } else {
    return []; // Se non c'è nulla, ritorna un array vuoto
  }
}
getFavorites();

// CONTROLLA SE UNA CANZONE E' GIA' TRA I PREFERITI
function isSongLiked(idCanzone) {
  const favorites = getFavorites();
  // Cerca nell'array se c'è un elemento con quell'ID
  return favorites.some(function (canzone) {
    return canzone.id === idCanzone;
  });
}

// AGGIUNGE O RIMUOVE (TOGGLE)
function toggleLike(songObj) {
  const favorites = getFavorites();

  // Cerchiamo se il brano è già nella lista
  const index = favorites.findIndex(function (canzone) {
    return canzone.id === songObj.id;
  });

  let aggiunto = false;

  if (index === -1) {
    // Se NON c'è (-1), lo aggiungiamo
    favorites.push(songObj);
    aggiunto = true;
    console.log("Aggiunto ai preferiti:", songObj.title);
  } else {
    // Se C'È già, lo togliamo (splice)
    favorites.splice(index, 1);
    aggiunto = false;
    console.log("Rimosso dai preferiti:", songObj.title);
  }

  // Salviamo la nuova lista aggiornata nel browser
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

  return aggiunto;
}

// NUOVO: Restituisce il numero di brani piaciuti di un artista specifico
function getCountOfLikedSongs(artistName) {
  const favorites = getFavorites();
  // Filtra l'array e tiene solo quelli dove il nome artista coincide
  const artistSongs = favorites.filter((song) => song.artist === artistName);
  return artistSongs.length;
}
