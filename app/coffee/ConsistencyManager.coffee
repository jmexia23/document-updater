latexParser = require('latex-parser').latexParser
text = require('./text')
lines = text.lines
relevant = [
		'paragraph'
		'section'
]


module.exports = ConsistencyManager =
	loadDoc: (project_id, doc_id,docLines, callback) ->
		parseDoc docLines, callback
		#push into redis table for all active clients in project (clients_in_project)

	parseDoc: (docLines, callback) ->

		position = 0
		symbols = []

		process = (i, line) ->
			parsedLine = []
			parsedLine = latexParser.parse(line).value

			if (!(typeof parsedLine[0] == 'undefined') and parsedLine[0].hasOwnProperty('name') and relevant.includes(parsedLine[0].name)) #assuming only one token per line
					symbols.push({
					'type': parsedLine[0].name
					'position': position #double check this; add 1??
					})

			position += line.length #also need line number??
			i++

			process i, line for line, i in docLines
