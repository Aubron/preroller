const fs = require('fs');
const Youtube = require("youtube-api");
const youtubedl = require('youtube-dl');

/**
 * Fetches Alamo preroll videos, and populates the /build/alamo directory with them
 */
class YoutubeInterface {
    constructor() {
        Youtube.authenticate({
            type: 'key',
            key: process.env.YOUTUBE_API_KEY
        })
    }


    // fetches from a specified playlist, and returns an array of videoIds
    fetchFromPlaylist = async (playlistId) => {
        let videos = [];
        
        // need to grab all the videos, paginated
        let breaker = false;
        let pageToken = '';
        while (!breaker) {
            let results = await Youtube.playlistItems.list({
                part: 'snippet,contentDetails',
                maxResults: 50,
                playlistId,
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

        // filter the array to removed deleted content
        videos = videos.filter((item) => {
            return item.snippet.title !== 'Deleted video'
        })

        // filter that list down to just ids.
        videos = videos.map((item) => {
            return item.snippet.resourceId.videoId;
        })

        return videos;

    }


    // uses the internal video property to fetch some random videos from the list and download them to /build/alamo
    downloadRandomVideos = async (videos,count) => {
        // clean up any already downloaded content.
        await this.cleanDownloadDirectories();

        // using an object to cheekily deduplicate via index overlap
        let downloadList = {};

        for (let i = 0; i < count; i += 1) {
            let index = Math.floor(Math.random() * videos.length);
            downloadList[videos[index]] = true;
        }
        downloadList = Object.keys(downloadList);

        // youtube-dl runs the show now.
        // we probably could do this parallel, but I was too paranoid youtube would be unhappy with this.
        for (let i = 0; i < downloadList.length; i += 1) {
            let video = youtubedl(`http://www.youtube.com/watch?v=${downloadList[i]}`,
                ['--format=mp4']);

            video.on('info', function(info) {
                console.log('YouTube Download started')
                console.log(info._filename)
            })

            video.on('error', (e) => {
                console.log('ERROR ' + e);
            });

            video.pipe(fs.createWriteStream(`./build/alamo/${i}.mp4`))
        }
    }

    cleanDownloadDirectories = () => {
        if (fs.existsSync('./build/alamo')) {
            // delete directory and contents
            fs.rmdirSync('./build/alamo', { recursive: true });
        }
        // make directory
        fs.mkdirSync('./build/alamo');
    }

}

module.exports = {
    YoutubeInterface
}