const populateUITracks = (tracks) => {
  const tracksContainer = getUITracks();
  tracksContainer.innerHTML = "";
  tracks.forEach((track) => {
    tracksContainer.innerHTML += createUITrack(track);
  });
};

const createUITrack = (track) => {
  return `
      <div class="col-6 col-md-4 col-lg-2">
        <div class="genre-card">
          <span class="genre-title">${track.title}</span>
          <img src="${track.album}"/>
          <div class="">
            <!-- continue here -->
          </div>
        </div>
      </div>
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

const getUITracks = () => {
  return document.querySelector("#tracks");
};
