var gm = require('gm').subClass({ imageMagick: true });
var fs = require('fs');
var glob = require('glob');
var async = require('async');

glob('*.jpeg', {}, function(error, files) {
	if(error) {
		console.log(error);
		return;
	}
	var photos = [];
	var count = files.length;
	for(var i = 0; i < count; ++i) {
		var photo = {};
		photo.filename = files[i];
		photo.gm = gm(files[i]);
		photos.push(photo);
	}

	async.auto({
		size: function(callback) {
			async.eachSeries(photos, function(photo, cb) {
				photo.gm.size(function(error, size) {
					if(!error) {
						photo.size = size;
					}
					cb(error);
				});
			}, function(error) {
				callback(error);
			});
		},
		thumbnails: ['size', function(callback) {
			async.eachSeries(photos, function(photo, cb) {
				var w, h;
				if(photo.size.width > photo.size.height) {
					h = 160;
				} else {
					w = 160;
				}
				photo.gm.resize(w, h, '>').write('thumbnails/' + photo.filename, function(error) {
					cb(null);
				});
			}, function(error) {
				callback(error);
			});
		}],
		manifest: ['thumbnails', function(callback) {
			fs.writeFile('manifest.json', JSON.stringify(photos.map(function(photo) {
				return {
					filename: photo.filename,
					size: photo.size
				};
			})));
		}]
	}, function(error) {
		// console.log(photos);
	});
});

