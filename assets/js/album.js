/**
 * Get album info from page URL and populate UI.
 */

/**
 * The input album should be an object simpler than
 * the API output; this wasy it's simple to access
 * the relevant properties while working with UI.
 */
const populateUIAlbum = (album) => {
  // populate only the album
  populateUIAlbumOnly(album);
  // populate only the tracks
  populateUIAlbumTracks(album);
};

// work with html here
const populateUIAlbumOnly = (album) => {
  const albumCover = getUIAlbumCover();
  const albumTitle = getUIAlbumTitle();
  const albumDuration = getUIAlbumDuration();
  const albumArtist = getUIAlbumArtist();
  const albumReleaseYear = getUIAlbumReleaseYear();

  albumCover.src = album.coverUrl.small;
  albumTitle.innerText = album.title;
  albumDuration.innerText = album.totalAlbumDurationForUI;
  albumArtist.innerText = album.artistName;
  albumReleaseYear.innerText = album.releaseYear;
};

const populateUIAlbumTracks = (album) => {
  const tracksTableRows = getUIAlbumTracksTableRows();
  // empty tracks rows
  tracksTableRows.innerHTML = "";
  album.tracks.forEach((track) => {
    tracksTableRows.innerHTML += createUIAlbumTrackHtmlStr(track);
  });
};

const createUIAlbumTrackHtmlStr = (track) => {
  return `
      <tr>
        <td class="text-secondary align-middle">${track.num}</td>
        <td>
        <div class="d-flex flex-column">
          <span class="text-white fw-bold text-truncate">${track.title}</span>
          <span class="text-secondary small">${track.artistName}</span>
        </div>
        </td>
        <td class="text-secondary align-middle text-end d-none d-md-table-cell">${track.rankForUI}</td>
        <td class="text-secondary align-middle text-end">${track.durationForUI}</td>
      </tr>
  `;
};

// ************* UI

const getUIAlbumSection = () => {
  return document.getElementById("album-section");
};

const getUIAlbumCover = () => {
  return document.getElementById("album-cover");
};

const getUIAlbumTitle = () => {
  return document.getElementById("album-title");
};

const getUIAlbumDuration = () => {
  return document.getElementById("album-duration");
};

const getUIAlbumArtist = () => {
  return document.getElementById("album-artist");
};

const getUIAlbumReleaseYear = () => {
  return document.getElementById("album-release-year");
};

const getUIAlbumTracksTableRows = () => {
  return document.getElementById("tracks-table").querySelector("tbody");
};

// ****************************

const onPageLoad = async () => {
  loadAlbumFromPageUrl();
  // you can insert any album id here.
  // loadAlbumWithId("75621062");
};

window.addEventListener("load", onPageLoad);

/**
 * Load album with given album id.
 */
const loadAlbumWithId = async (albumId) => {
  try {
    const album = await getRemoteAlbum(albumId);
    populateUIAlbum(getSimplerAlbumInfo(album));
    console.log("simpler album info: ", getSimplerAlbumInfo(album));
  } catch (err) {
    console.error(err);
  }
};

/**
 * Load album from page url (so with ?albumId=xxx in the page url)
 */
const loadAlbumFromPageUrl = async () => {
  try {
    const album = await getRemoteAlbum(getAlbumIdFromUrl());
    populateUIAlbum(getSimplerAlbumInfo(album));
    console.log("simpler album info: ", getSimplerAlbumInfo(album));
  } catch (err) {
    console.error(err);
  }
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
  const coverUrl = {
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
      rankForUI: helpers.getTrackRankForUI(track.rank),
      // 3:54
      durationForUI: helpers.getTrackDurationForUI(track.duration),
    };
  });

  return {
    // Gioventù brucata
    title,
    // {small, big, etc.}
    coverUrl,
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
