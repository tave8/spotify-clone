const helpers = {
  /**
   * Returns the value of a query string parameter
   */
  getUrlQueryParam: function (param) {
    // if does not exist, throw error
    const url = location.search;
    const params = new URLSearchParams(url);
    const value = params.get(param);
    if (value === null) {
      throw Error(`query param ${param} does not exist`);
    }
    return value;
  },

  // ******* FORMATTERS

  /**
   * Returns the year of date string.
   *
   * example output:
   *    2017
   */
  getYearFromDate: function (dateStr) {
    return new Date(dateStr).getFullYear();
  },

  /**
   * Returns the album duration formatted as X min Y sec.
   * where X = minutes and Y = seconds.
   *
   * example output:
   *    53 min 20 sec.
   */
  getAlbumDurationForUI: function (totSeconds) {
    const minutes = Math.floor(totSeconds / 60);
    const seconds = totSeconds % 60;
    const ret = `${minutes} min ${seconds} sec.`;
    return ret;
  },

  /**
   * Returns the track duration formatted as X:Y
   * where X = minutes and Y = seconds.
   *
   * example output:
   *   3:54
   */
  getTrackDurationForUI: function (totSeconds) {
    const minutes = Math.floor(totSeconds / 60);
    const seconds = totSeconds % 60;
    const secondsFilledWithZero = this.leftPadZeroInSeconds(seconds);
    const ret = `${minutes}:${secondsFilledWithZero}`;
    return ret;
  },

  /**
   * Left pads seconds that are less than 10.
   * examples:
   *      0  -> 00
   *      5  -> 05
   *      9  -> 09
   *      12 -> 12
   *
   */
  leftPadZeroInSeconds: function (seconds) {
    if (seconds < 10) {
      return `0${seconds}`;
    }
    return `${seconds}`;
  },
};
