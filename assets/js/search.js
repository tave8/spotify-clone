const populateUITracks = (tracks) => {
    
}

const onSearchInputTypingStopped = async (userSearch, moreInfo) => {
  try {
    const tracksData = await searchRemoteTracks(userSearch);
    // tracks list
    const tracks = tracksData.data
    console.log("search result: ", tracks)
    populateUITracks(tracks)
  } catch (err) {
    console.error(err)
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
