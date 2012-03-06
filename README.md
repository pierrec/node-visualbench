# Visual Bench

## Synopsis

Visual Bench sits on top of [bench](https://github.com/isaacs/node-bench) and it has a dual purpose:

* Automatically save the benchmarks into a data file in JSON format
* Allow the results to be visualized in a web browser


## Installation

`npm install visualbench -g`


## Usage

### Generating some data

Load the module and supply an id to use as a data key, and optionally a file where to store the data.

```javascript
var bench = require('visualbench')('emit:0.0.4')
```

### Showing the data

Start the server with `vbserver`.

For more options, run `vbserver --help`.

For debugging, run `DEBUG=http vbserver`.


## Example

First, generate some data.

```javascript
var bench = require('visualbench')('testId')

// Straight from the `bench` examples
var foo = 1
  , bar = 2

function tmpvar () {
  var _ = foo
  foo = bar
  bar = _
}
function arrswap () {
  foo = [bar, bar = foo][0]
}
function fnswap () {
  (function(x,y){foo=x;bar=y})(bar,foo)
}

exports.compare =
  { tmpvar: tmpvar
  , arrswap: arrswap
  , fnswap: fnswap
  , "nil function":function () {}
  }

bench.runMain()
```

This will generate the `data.json` file, containing something similar to the following data.

```javascript
{
	"var-swap":
		{
			"tmpvar": [
				117527.47252747252, 115553.44655344656, 113636.36363636363, 99736.26373626373, 98266.73326673327
			]
		,	"arrswap": [
				60341.65834165834, 58489.51048951049, 57202.79720279721, 54672.32767232767, 53621.37862137862
			]
		,	"fnswap":	[
				55766.23376623377, 54548.45154845155, 51734.26573426573, 51650.34965034965, 51682.317682317684
			]
		,	"nil function": [
				149618.38161838162, 149757.24275724276, 144548.45154845156, 127869.13086913087, 127647.35264735264
			]
		}
}
```

Start the web server.

`vbserver`

Point your web browser at `http://localhost:8080`

Enjoy the results!

![visualbench](https://github.com/pierrec/node-atok/tree/master/img/vb.png)

## Credits

Special thanks to...

* [Flot](http://code.google.com/p/flot/)
* [Bootstrap](http://twitter.github.com/bootstrap/index.html)
* [Jade](http://jade-lang.com/)
