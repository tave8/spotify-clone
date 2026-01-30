const onLoadPage = () => {
  addEventHandlers();
  focusUISearchInput();
  searchIfQueryInUrl();
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

/**
 * If there is a "query" param in the URL, perform a search with its value,
 * as if the user had typed it in the search input.
 */
const searchIfQueryInUrl = () => {
  if (!existsQueryUrlParam()) {
    return;
  }
  // something like "beatles" in ?query=beatles
  const userSearch = getQueryUrlParam();
  // set the search input value to match the query param
  const searchInput = getUISearchInput();
  searchInput.value = userSearch;

  searchTracks(userSearch);
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

/**
 * Performs a search for tracks with the given user search string.
 * Can be used as a callback for when the user stops typing in the search input,
 * or can be invoked directly (for example, when loading the page if there is a "query" param in the URL).
 */
const searchTracks = async (userSearch) => {
  try {
    showUISearchInputSpinner();

    const tracksData = await searchRemoteTracks(userSearch);
    console.log("search result: ", getSimplerTracksInfo(tracksData));
    populateUITracks(getSimplerTracksInfo(tracksData));

    showUISearchInputSpinner(false);
  } catch (err) {
    console.error(err);
    showUISearchInputSpinner(false);
  }
};

/**
 * Callback invoked when user stops typing in the search input.
 */
const onSearchInputTypingStopped = async (userSearch, moreInfo) => {
  searchTracks(userSearch);
};

const showUISearchInputSpinner = (show = true) => {
  const spinner = getUISearchInputSpinner();
  if (show) {
    spinner.classList.remove("visually-hidden");
  } else {
    spinner.classList.add("visually-hidden");
  }
};

const showUILastSearchesIfAny = () => {
  getUILastSearchResults().style.visibility = "visible";
}

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

const addEventHandlers = () => {
  getUISearchInput().addEventListener("keyup", handleTypingSearchInput);
  // getUISearchInput().addEventListener("focus", handleFocusSearchInput);  
};

// when user types in search input, update the query url param
const handleTypingSearchInput = (event) => {
  const userSearch = event.target.value;
  helpers.updateUrlQueryParam("query", userSearch);
};

const handleFocusSearchInput = (event) => {
  // show last searches, if any
  // showUILastSearchesIfAny()
}

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

const getUILastSearchResults = () => {
  return document.querySelector("#last-search-results");
};

const getUISearchInputSpinner = () => {
  return document.querySelector(".search-bar-container .search-input-spinner");
};

const existsQueryUrlParam = () => {
  return helpers.existsUrlQueryParam("query");
};

const getQueryUrlParam = () => {
  return helpers.getUrlQueryParam("query");
};
