(function (require, module, exports) {

    var path = require('path');
    var cp = require('child_process');
    var platform = 'win';
    var os = require('os');
    var tmpDir = os.tmpDir();
    var crypto = require('crypto');
    var fs = require('fs');

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

    var contains = function (list, val) {

        var c = false;

        list.forEach(function (item) {

            if (val === item) {

                c = true;

                return false;
            }

            return true;

        });

        return c;
    };


    exports.optimize = function (image, callback) {

        var called = false;

        var _complete = function (err, data) {

            if (!called) {
                callback(err, data);
                called = true;
            }

        };

        var ext = path.extname(image).slice(1);

        var tmpFileName = crypto.createHash('md5').update(image).digest('hex');

        tmpFileName = path.join(tmpDir, tmpFileName);

        fs.stat(image, function (err, actualStat) {

            if (err) return callback(err);

            var rs = fs.createReadStream(image);

            rs.on('error', function (err) {

                _complete(err);

            });

            var ws = fs.createWriteStream(tmpFileName);

            ws.on('error', function () {

                _complete(err);

            });

            rs.pipe(ws);

            ws.on('close', function () {

                var executable = (contains(png, ext)) ? optipngPath : jpegTranPath;

                var cmd = (contains(png, ext)) ? [tmpFileName] : ['-outfile', tmpFileName, '-optimize', tmpFileName];

                var optimizeProcess;

                try {

                    //Spawn child process to optimize image
                    optimizeProcess = cp.spawn(executable, cmd);

                } catch (err) {

                    return process.nextTick(function () {
                        _complete(err);
                    })

                }


                optimizeProcess.once('error', function (err) {
                    _complete(err);
                });

                optimizeProcess.once('exit', function (data) {

                    if (data.toString() !== '0') {

                        _complete(new Error('Failed To Optimize Image'));

                    } else {

                        fs.stat(tmpFileName, function (err, newStat) {

                            if (err) return _complete(err);

                            if (newStat.size >= actualStat.size) return _complete(new Error('Unable to optimize image, The image seems to be previously optimized.'));

                            var rs = fs.createReadStream(tmpFileName);

                            rs.on('error', function (err) {

                                _complete(err);

                            });

                            var ws = fs.createWriteStream(image);

                            ws.on('error', function () {

                                _complete(err);

                            });

                            rs.pipe(ws);

                            ws.on('close', function () {

                                fs.unlink(tmpFileName, function(err) {

                                    if(err) return _complete(err);

                                    _complete(null);

                                });

                            });
                        });
                    }

                    optimizeProcess = null;
                });
            });

        });
    };

})(require, module, exports);
