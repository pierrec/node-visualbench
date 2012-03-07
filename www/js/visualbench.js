/**
  Main function dealing with GUI elements and graphing
**/
$(document).ready(function () {
	// Helpers
	function setId (id) {
		return 'id_' + id.replace(/[^a-zA-Z0-9_\-]/g, '_')
	}
	function render (name, obj, flag) {
		var tpl = $('#' + name + '-template')
			, html = tpl.text().trim()
			, fn = render[name] = render[name] || jade.compile(html)

		return flag ? tpl.after( fn(obj) ) : fn(obj)
	}

	// Render default UI components
	$.ajax({
		url: 'package.json'
	, dataType: 'json'
	, success: function (data) {
			render('mainbar', data, true)

			loadData()
		}
	})

	// List of available data sets
	function loadData () {
		$.ajax({
			url: 'data'
		, dataType: 'json'
		, success: function (data) {
				var files = {}
				
				data.forEach(function (file) {
					file = file.replace(/\.json$/, '')
					files[ setId(file) ] = file
				})
				
				var o = { files: files }

				// console.log(o)
				// Datasets menu
				render('files', o, true)

				var toc = $('#files')
					, $document = $(document)
				
				$document.scroll(function() {
					var flag = ($document.scrollTop() >= 40)

					toc.toggleClass('subnav-fixed', flag)
					// toc.scrollspy('refresh') // HACK: targets/offsets get emptied for some reason...
				})

				// For each dataset, a graph is associated
				render('graph', o, true)
				toc.scrollspy()

				// Initialize the graphs
				Object.keys(files).forEach(function (f) {
					// console.log(f, files[f])
					initGraph(f, files[f])
				})
			}
		})
	}

	/*
		Graphing library helper
	**/
	function initGraph (id, file) {
		var options = {
			series: {
				lines: { show: true }
			, points: { show: true }
			}
		, zoom: { interactive: true }
		, pan: { interactive: true }
		, grid: { hoverable: true, clickable: true }
		}

		var placeholder = $('#' + id + '-graph')
		var plot

		draw()

		function draw () {
			plot = $.plot(placeholder, [], options)
			displayDataSet( file )
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
			if ( $('#' + id + ' .btn[title="Tooltip"].active').length > 0 ) {
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
		$('#' + id + '-controls').find('.btn').each(function (i) {
			var $this = $(this)
				, title = $this.attr('title')

			$this.click(function (e) {
				e.preventDefault()
				switch (title) {
					case 'Zoom out':
						plot.zoomOut()
					break
					case 'Zoom in':
						plot.zoom()
					break
					case 'Refresh':
						draw()
					break
					case 'Download':
						var p = $('#' + id + '-graph .flot-base')
						var data = p[0].toDataURL('image/png')
						document.location.href = data.replace('image/png', 'image/octet-stream')
					break
					default:
				}
			})
		})

		function displayDataSet (dataset) {
			var url = '/data/' + dataset + '.json'
			// console.log('Loading', url)
			$.ajax({
				url: url
			, dataType: 'json'
			, error: function (xhr, status, msg) {
					console.log('ERROR', url, msg)
				}
			, success: function (data) {
					var keys = {}

					Object.keys(data).forEach(function (key) {
						keys[ setId(key) ] = key
					})

					var html = render('keys', { name: id, keys: keys })
					var target = $('#' + id + '-keys')

					target.empty()
					$(html).appendTo(target)

					Object.keys(keys).forEach(function (keyId) {
						var key = keys[keyId]

						$('#' + keyId + '-' + id + '-key').click(function (e) {
							e.preventDefault()
							// console.log('<', data[key])
							// console.log('>', transform( data[key] ))
							plot.setData( transform( data[key] ) )
							plot.setupGrid()
							plot.draw()
						})
					})
				}
			})
		}
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