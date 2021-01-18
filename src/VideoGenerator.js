const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const d3 = require('d3-array');

const monitoredDirectories = ['alamo', 'apple'];

/**
 * Responsible for assembling a single preroll video from randomly ordered files across multiple directories.
 */
class VideoGenerator {

    generateVideoOutput = async () => {
        const command = ffmpeg({}).videoCodec('libx264')
        
        // fetch the videos from watched directories in random order.
        let videos = this.aggregateVideos();
        let filter = '';
        for (let i = 0; i < videos.length; i += 1) {
            command
                .input(videos[i]);
            filter += `[${i}]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}];`
        }

        for (let i = 0; i < videos.length; i += 1) {
            filter += `[v${i}][${i}:a:0]`
        }

        filter += `concat=n=${videos.length}:v=1:a=1`

        await command
            .on('end', function() {
                console.log('Files have been merged succesfully. Happy watching!');
            })
            .on('start', (cmdline) => {
                console.log(cmdline)
            })
            .on('error', function(err,err2,err3) {
            console.log('an error happened: ' + err.message);
            })
            .complexFilter([filter])
            .output('./build/output.mp4')
            .run();
    }

    aggregateVideos = () => {
        let files = [];
        for (let i = 0; i < monitoredDirectories.length; i += 1) {
            var newFiles = fs.readdirSync(`./build/${monitoredDirectories[i]}`);
            newFiles = newFiles.map((file) => {
                return `./build/${monitoredDirectories[i]}/${file}`
            })
            files = files.concat(newFiles);
        }
        d3.shuffle(files);
        return files;
    }

}

module.exports = {
    VideoGenerator
}