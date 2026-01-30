const onLoadPage = () => {
  addEventHandlers();
  focusUISearchInput();
};

window.addEventListener("load", onLoadPage);

const populateUITracks = (tracks) => {
  const tracksContainer = getUITracks();
  tracksContainer.innerHTML = "";
  tracks.forEach((track) => {
    tracksContainer.innerHTML += createUITrack(track);
  });
};

const createUITrack = (track) => {
  return `
      <!-- START SEARCH CARD -->
      <div class="card search-card text-white text-center animated" style="width: 18rem" background-color: #181818;">
        <!-- track artist cover -->
        <a href="./artist.html?artist_id=${track.artist.id}"><img src="${track.album.cover_medium}" class=" w-100 mt-2" alt="..." style="object-fit: contain" /></a>
        <div class="card-body">
          <!-- track title -->
          <h5 class="card-title text-center"><a href="./album.html?album_id=${track.album.id}">${track.title}</a></h5>
        </div>
      </div>
      <!-- END SEARCH CARD -->
  `;
};

const getSimplerTracksInfo = (tracksData) => {
  const tracks = tracksData.data;
  return tracks.map((track) => {
    return {
      title: track.title,
      artist: track.artist,
      album: track.album,
      preview: track.preview,
    };
  });
};

const onSearchInputTypingStopped = async (userSearch, moreInfo) => {
  try {
    const tracksData = await searchRemoteTracks(userSearch);
    console.log("search result: ", getSimplerTracksInfo(tracksData));
    populateUITracks(getSimplerTracksInfo(tracksData));
  } catch (err) {
    console.error(err);
  }
};

const searchRemoteTracks = async (search) => {
  const url = `${vars.DEEZER_API_URL}/search?q=${search}`;
  const config = {};
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error("error with response. status: ", resp.status);
  }
  const data = await resp.json();
  return data;
};

// Typing Delayer library
new TypingDelayer({
  // the input CSS selector
  inputSelector: "#search-input",
  // reference to the callback
  onTypingStopped: onSearchInputTypingStopped,
  minChars: 3,
});

const addEventHandlers = () => {};

const focusUISearchInput = () => {
  const searchInput = getUISearchInput();
  searchInput.focus();
};

const getUITracks = () => {
  return document.querySelector("#tracks");
};

const getUISearchInput = () => {
  return document.querySelector("#search-input");
};
