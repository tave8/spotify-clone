/**
 * Get artist info from page URL and populate UI.
 */

const onPageLoad = async () => {
  loadArtistAndTopTracks();
};

window.addEventListener("load", onPageLoad);

const loadArtistAndTopTracks = async () => {
  try {
    // artist info only
    const artist = await getRemoteArtist(getArtistIdFromUrl());
    populateUIArtist(getSimplerArtistInfo(artist));

    // top tracks of this artist
    const topTracksData = await getRemoteTopTracks(artist.tracklist);
    const topTracks = topTracksData.data;
    populateUITopTracks(getSimplerTopTracksInfo(topTracks));
  } catch (err) {
    console.error(err);
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
  console.log(artist);
};

const populateUITopTracks = (topTracks) => {
  // continue here: populate the top tracks UI
  console.log(topTracks);
};

const getRemoteArtist = async (artistId) => {
  const url = `${vars.DEEZER_API_URL}/artist/${artistId}`;
  const config = {};
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error("error with response. status: ", resp.status);
  }
  const data = await resp.json();
  return data;
};

const getRemoteTopTracks = async (topTracksUrl) => {
  const url = topTracksUrl;
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
      title: track.title,
      durationForUI: helpers.getTrackDurationForUI(track.duration),
      rank: track.rank,
      albumCover: {
        big: track.album.cover_big,
        medium: track.album.cover_medium,
        small: track.album.cover_small,
        xl: track.album.cover_xl,
      },
    };
  });
};

const getArtistIdFromUrl = () => {
  return helpers.getUrlQueryParam(vars.ARTIST_ID_QUERY_PARAM);
};
