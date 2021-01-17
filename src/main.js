require('dotenv').config()
const { YoutubeInterface } = require('./YoutubeInterface');


const main = async () => {
    let youtube = new YoutubeInterface();

    // using a specific alamo drafthouse PSA playlist
    let videos = await youtube.fetchFromPlaylist('PLU2RdDviHG4LSl0FHmhD0NtSgTGn6fPWq');

    // average video lenth is 1:14, we hope to get 20mins, of which ~7 is this, and ~13 are movie trailers.
    // so we'll fetch 6
    youtube.downloadRandomVideos(videos,6);
}


main();