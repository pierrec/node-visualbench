// Process bench examples

var path = require('path')

var fileset = require('fileset')
var bench = require('bench')

fileset('/home/pierre/node_modules/bench/examples/*.js', '', function (err, list) {
	if (err) throw err

	list.forEach(function (file) {
		var newfile = path.basename(file)
		echo(file, '->', newfile)
		cat(file)
			.replace('require("../")', 'require("../")("' + newfile.replace('\.js', '') + '")')
			.to(newfile)
	})
})
