var path = require('path');
var cp = require('child_process');

var platform = 'win';

if (process.platform === 'darwin') platform = 'osx';

if (process.platform === 'linux') platform = 'linux';

var arch = (process.arch === 'x64') ? 'x64' : 'x86';

var binPath = path.join(__dirname, 'vendor');

var jpegTranPath = path.join(binPath, 'jpegtran', platform, arch, 'jpegtran');

var optipngPath = path.join(binPath, 'optipng', platform, 'optipng');

if (platform === 'win') {
    jpegTranPath += '.exe';
    optipngPath += '.exe';
}

if (platform === 'osx') jpegTranPath = path.join(binPath, 'jpegtran', platform, 'jpegtran');

if (platform === 'linux') optipngPath = path.join(binPath, 'optipng', platform, arch, 'optipng');

var jpg = ['jpg', 'jpeg'];

var png = ['png', 'tif', 'tiff'];

var contains = function(list, val) {

    var c = false;

    list.forEach(function(item) {

        if(val === item) {

            c = true;

            return false;
        }

        return true;

    });

    return c;
};


exports.optimize = function(image, callback) {
	
    var ext = path.extname(image).slice(1);

    var executable = (contains(png, ext)) ? optipngPath : jpegTranPath;

    var cmd = (contains(png, ext)) ? [image] : ['-outfile', image, '-optimize', image];

    //Spawn child process to optimize image
    var optimizeProcess = cp.spawn(executable, cmd);

    optimizeProcess.once('error', function (err) {
        callback(err);
    });

    optimizeProcess.once('exit', function (data) {

        if (data.toString() !== '0') {

            callback(new Error('Failed To Optimize Image'));

        } else {

            callback(null);
        }

        optimizeProcess = null;
    });

};