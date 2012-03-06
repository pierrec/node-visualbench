/**
  Define `done()` to save the benchmark results to a file.

  Usage:
    require('visualbench')(id [, filename])

  where
  * id (String): data key id used to store the results
  * filename: optional filename (default='data')
**/
var path = require('path')

var fstream = require('fstream')
var bench = require('bench')

var main = bench.runMain

module.exports = function (id /*, filename */) {
	var script = module.parent.filename
	var filename = path.join(
			path.dirname( script )
		, (arguments[1] || 'data') + '.json'
		)
	var data = path.existsSync(filename)
		? require(filename)
		: {}

	function done (results) {
		data[id] = results

		fstream.Writer({ path: filename })
			.on('close', function () {
				console.log('Data written out to %s', filename)
			})
			.end( JSON.stringify(data) )
	}

	// Overload bench's main function
	bench.runMain = function () {
		var exp = require.main.exports

		exp.done = exp.done || done

		return main.apply(this, arguments)
	}

	return bench
}
