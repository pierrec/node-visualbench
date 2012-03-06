/**
  Main function dealing with GUI elements and graphing
**/
$(document).ready(function () {
	// List of available data sets
	$.ajax({
		url: 'data'
	, dataType: 'json'
	, success: function (data) {
			var files = data.map(function (f) { return f.replace(/\.json/, '') })
			var o = {
				files: files.map( sanitize4id )
			}
			// Datasets menu
			render('files', o, true)
			// fix sub nav on scroll
			var $win = $(window)
			, $nav = $('.subnav')
			, navTop = $nav.length && $nav.offset().top - 40

			// processScroll()
			// $win.on('scroll', processScroll)

			function processScroll() {
				$nav.toggleClass('subnav-fixed', ($win.scrollTop() >= navTop))
			}
			
			// For each dataset, a graph is associated
			render('graph', o, true)
			// Initialize the graphs
			files.forEach( initGraph )
		}
	})

	/*
		Templating engine helpers
	**/
	function render (name, obj, flag) {
		var tpl = $('#' + name + '-template')
			, html = tpl.text().trim()
			, fn = render[name] = render[name] || jade.compile(html)

		return flag ? tpl.after( fn(obj) ) : fn(obj)
	}

	/*
		Graphing library helper
	**/
	function initGraph (name) {
		var options = {
			series: {
				lines: { show: true }
			, points: { show: true }
			}
		, zoom: { interactive: true }
		, pan: { interactive: true }
		, grid: { hoverable: true, clickable: true }
		}

		var placeholder = $('#' + sanitize4id(name) + '-graph')
		var plot

		draw()

		function draw () {
			plot = $.plot(placeholder, [], options)
			displayDataSet( name + '.json' )
		}

		function showTooltip(x, y, contents) {
			$('<div id="tooltip">' + contents + '</div>')
			.css(
				{
					position: 'absolute'
				, top: y - 15
				, left: x + 15
				, padding: '2px'
				}
			)
			.addClass('well')
			.appendTo('body')
		}

		var previousPoint = null
		placeholder.bind("plothover", function (event, pos, item) {
			if ( $('#' + name + '-showTooltip.active').length > 0 ) {
				if (item) {
					if (previousPoint != item.dataIndex) {
						previousPoint = item.dataIndex

						$("#tooltip").remove()
						var x = item.datapoint[0].toFixed(2)
							, y = item.datapoint[1].toFixed(2)

						showTooltip(
							item.pageX
						, item.pageY
						, item.series.label + '(' + x + ')=' + y
						)
					}
				} else {
					$("#tooltip").remove()
					previousPoint = null
				}
			}
		})

		// Controls
		$('#' + name + '-controls .btn').each(function (i) {
			$(this).click(function (e) {
				e.preventDefault()
				switch (i) {
					case 0:
						plot.zoomOut()
					break
					case 1:
						plot.zoom()
					break
					case 2:
						draw()
					break
					default:
				}
			})
		})

		function displayDataSet (dataset) {
			console.log('Loading', dataset)
			$.ajax({
				url: '/data/' + dataset
			, dataType: 'json'
			, success: function (data) {
					var keys = Object.keys(data)
					var html = render('keys', { name: name, keys: keys })
					var target = $('#' + name + '-keys')
					target.empty()
					$(html).appendTo(target)

					keys.forEach(function (key) {
						$('#' + key + '-' + name + '-key').each(function (i) {
							$(this).click(function (e) {
								e.preventDefault()
								// console.log('<', data[key])
								// console.log('>', transform( data[key] ))
								plot.setData( transform( data[key] ) )
								plot.setupGrid()
							 	plot.draw()
							})
						})
					})
				}
			})
		}
	}

	function sanitize4id (id) {
		return id.replace( RegExp('[^a-zA-Z0-9_\\-:\\.]', 'g'), '_')
	}

	// Transform the raw benchmarks into something useable by `flot`
	function transform (data) {
		// data: { serie: [x...] }
		// console.log('data', data)

		var toPlot = []
		var series = {}

		for (var serie in data) {
			if (!series[serie]) series[serie] = []
			var avg = 0
				, arr = data[serie]

			for (var i = 0, n = arr.length; i < n; i++)
				series[serie].push( [ i, arr[i] ] )
		}
		// console.log('series', series)

		for (var serie in series)
			toPlot.push( {
				label: serie
			, data: series[serie]
			} )

		// toPlot: [ { label: serie, data: [ [x, y] ]} ]
		// console.log('toPlot', toPlot)
		return toPlot
	}
})