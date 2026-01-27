/**
 * Get album info from page URL and populate UI.
 */


const onPageLoad = async () => {
  loadAlbum();
};

window.addEventListener("load", onPageLoad);

const loadAlbum = async () => {
  try {
    const album = await getRemoteAlbum(getAlbumIdFromUrl());
    populateAlbum(getSimplerAlbumInfo(album));
  } catch (err) {
    console.error(err);
  }
};

/**
 * The input album should be an object simpler than 
 * the API output; this wasy it's simple to access
 * the relevant properties while working with UI.
 */
const populateAlbum = (album) => {
    // continue here: populate the UI with album 
    // and its tracks 
};

const getRemoteAlbum = async (albumId) => {
  const url = `${vars.DEEZER_API_URL}/album/${albumId}`;
  const config = {};
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error("error with response. status: ", resp.status);
  }
  const data = await resp.json();
  return data;
};

/**
 * Outputs the album info into fields
 * that are more intuitive to access/remember.
 *
 *  Album info:
 *    name
 *    artist
 *    year
 *    total tracks
 *    total tracks length
 *    tracks
 *      total played
 *      length
 */
const getSimplerAlbumInfo = (album) => {
  const title = album.title;
  const artistName = album.artist.name;
  const releaseYear = helpers.getYearFromDate(album.release_date);
  const cover = {
    big: album.cover_big,
    medium: album.cover_medium,
    small: album.cover_small,
    xl: album.cover_xl,
  };
  const totalTracks = album.nb_tracks;
  const totalTracksDurationSec = album.duration;
  // 53 min 20 sec.
  const totalAlbumDurationForUI = helpers.getAlbumDurationForUI(totalTracksDurationSec);

  let trackNum = 0;
  const tracks = album.tracks.data.map((track) => {
    trackNum += 1;
    return {
      // 1, 2, 3, ...
      num: trackNum,
      title: track.title,
      artistName: track.artist.name,
      rank: track.rank,
      // 3:54
      durationForUI: helpers.getTrackDurationForUI(track.duration),
    };
  });

  return {
    // Gioventù brucata
    title,
    // {small, big, etc.}
    cover,
    // Pinguini Tattici Nuclear
    artistName,
    // 2017
    releaseYear,
    // 12
    totalTracks,
    // 53 min 20 sec.
    totalAlbumDurationForUI,
    // [track]
    tracks,
  };
};




const getAlbumIdFromUrl = () => {
  return helpers.getUrlQueryParam(vars.ALBUM_ID_QUERY_PARAM);
};
