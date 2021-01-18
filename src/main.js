require('dotenv').config()
const { YoutubeInterface } = require('./YoutubeInterface');
const { VideoGenerator } = require('./VideoGenerator');
const { AppleInterface } = require('./AppleInterface');

let debugNoDownload = parseInt(process.env.DEBUG_NO_DOWNLOAD, 10);

const main = async () => {

    // start by grabbing the videos from YouTube
    let youtube = new YoutubeInterface();
    if (!debugNoDownload) {
        // using a specific alamo drafthouse PSA playlist
        let videos = await youtube.fetchFromPlaylist('PLU2RdDviHG4LSl0FHmhD0NtSgTGn6fPWq');

        // average video lenth is 1:14, we hope to get 20mins, of which ~7 is this, and ~13 are movie trailers.
        // so we'll fetch 6
        await youtube.downloadRandomVideos(videos,6);


        

        // Now, we grab the most popular videos from Apple
        // targeting ~13 minutes for trailers, 90s-2m trailers, getting the top 7
        let apple = new AppleInterface();
        await apple.getPopularTrailers(7);

    } else {
        console.log('[DEBUG] - Skipping download step')
    }



    // Time to assemble the video
    let generator = new VideoGenerator();
    await generator.generateVideoOutput();
    
}


main();