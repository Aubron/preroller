const fetch = require('node-fetch');
const fs = require('fs');
const { getFileAsync } = require('./utils');

class AppleInterface {
    getPopularTrailers = async (count) => {
        this.cleanDownloadDirectories();
        let popularTrailers = await fetch('https://trailers.apple.com/trailers/home/feeds/most_pop.json')
            .then((res) => res.json())
        for (let i = 0; i < count; i += 1) {
            let url = await this.getVideoUrlFromTrailer(popularTrailers[i])
            if (url !== null) {
                console.log('Apple Trailer Download started')
                console.log(url)
                await getFileAsync(url, `./build/apple/${i}.m4v`);
            }
        }
    }

    getVideoUrlFromTrailer = async (trailer) => {
        // we use the "location" attribute to find where the videos are hosted, and get that HTML page
        let webpage = await fetch(`https://trailers.apple.com${trailer.location}`)
            .then((res) => res.text());

        
        // then we regex that text to grab an internal ID out of a meta field
        let regex = /app-argument=movietrailers:\/\/movie\/detail\/(\d+)/
        let match = webpage.match(regex);
        let id = parseInt(match[1], 10);
        if (id && id !== NaN) {
            // now that we have the secret ID, we can grab a JSON file with the file locations.
            let details = await fetch(`http://trailers.apple.com/trailers/feeds/data/${id}.json`)
                .then((res) => res.json())
            let url = null;
            for (let i = 0; i < details.clips.length; i += 1) {
                let clip = details.clips[details.clips.length - 1 - i];

                // we don't want movie clips, and we want to make sure we're looking at US content, willing to drop files as a result
                if (clip.title.includes("Trailer") && clip.versions.enus) {
                    
                    // prefer 1080
                    if (clip.versions.enus.sizes.hd1080) {
                        url = clip.versions.enus.sizes.hd1080.srcAlt
                    } else {
                        // otherwise, loop till we find something < 1080
                        let keys = Object.keys(clip.versions.enus.sizes);
                        for (let i = 0; i < keys.length; i += 1) {
                            // TODO: Relying on object key ordering here, which I believe is a bad idea.
                            let variant = clip.title.versions.enus.sizes[keys[keys.length - 1 - i]]
                            if (variant.height < 1080) {
                                url = variant.srcAlt;
                            }
                        }
                    }
                }
            }

            return url;
        }
    }

    cleanDownloadDirectories = () => {
        if (fs.existsSync('./build/apple')) {
            // delete directory and contents
            fs.rmdirSync('./build/apple', { recursive: true });
        }
        // make directory
        fs.mkdirSync('./build/apple');
    }
}

module.exports = {
    AppleInterface
}