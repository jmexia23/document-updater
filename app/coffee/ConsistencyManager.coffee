crypto = require('crypto')
latexParser = require('latex-parser').latexParser
RedisManager = require "./RedisManager"
text = require('./text')

lines = text.lines
relevant = [
		'paragraph'
		'section'
]


module.exports = ConsistencyManager =
	loadDoc: (project_id, doc_id, docLines, callback) ->
		parseDoc docLines, (error,  symbols ) =>
			return callback(error) if error?
			RedisManager.loadConsistencyTables project_id, doc_id, symbols, (error) ->
				return callback(error) if error?  #push into redis table for all active clients in project (clients_in_project)


	parseDoc: (docLines, callback) ->  #add error checking??

		position = 0
		symbols = []

		process = (i, line) ->
			parsedLine = []
			parsedLine = latexParser.parse(line).value					#consider using .filter

			if (!(typeof parsedLine[0] == 'undefined') and parsedLine[0].hasOwnProperty('name') and relevant.includes(parsedLine[0].name)) #assuming only one token per line
					symbols.push({
					'type': parsedLine[0].name
					'position': position #double check this; add 1??
					'id' : makeID
					})

			position += line.length #also need line number??
			i++

			process i, line for line, i in docLines

		callback null, symbols

	makeID : ->
		crypto.randomBytes(8).toString 'base64'
		  
