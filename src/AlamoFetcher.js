const Parser = require('rss-parser');
const Youtube = require("youtube-api");

/**
 * Fetches alamo preroll videos, and populates the /build/alamo directory with them
 */
class AlamoFetcher {
    constructor() {
        this.videos;
        this.parser = new Parser();
        console.log(process.env.YOUTUBE_API_KEY);
        Youtube.authenticate({
            type: 'key',
            key: process.env.YOUTUBE_API_KEY
        })
        this.getVideos();
    }

    getVideos = async () => {
        let videos = [];
        
        // need to grab all the videos, paginated
        let breaker = false;
        let pageToken = '';
        while (!breaker) {
            let results = await Youtube.playlistItems.list({
                part: 'snippet',
                playlistId: 'PLU2RdDviHG4LSl0FHmhD0NtSgTGn6fPWq',
                maxResults: 50,
                pageToken
            });

            // add the videos to the array
            videos = videos.concat(results.data.items);

            // move the page token if available, break if not
            if (results.data.nextPageToken) {
                pageToken = results.data.nextPageToken;
            } else {
                breaker = true;
            }
        }
        // filter that list down to just ids.
        videos = videos.map((item) => {
            return item.snippet.resourceId.videoId;
        })

        this.videos = videos;
        console.log(this.videos);

    }

}

module.exports = {
    AlamoFetcher
}