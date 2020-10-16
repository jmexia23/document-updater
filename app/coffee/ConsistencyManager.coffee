crypto = require('crypto')
latexParser = require('latex-parser').latexParser
RedisManager = require "./RedisManager"
text = require('./text')

lines = text.lines
relevant = [				#temporary
		'paragraph'
		'section'
]
fullText = lines.map((item) ->
	if item == '' then '\n' else item
).join('')



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
					'id' : ConsistencyManager.makeID()
					})

			if !(typeof parsedLine[0] == 'undefined') then (position += line.length) else (position += 1) #also need line number??
		

		process i, line for line, i in docLines
		
		i = j = 0						#j is needed??
		len = symbols.length
		while j < len
			object = symbols[i]
			next = symbols[i + 1]
			ConsistencyManager.getSnapshots i, object, next
			i = ++j

		callback null, symbols

	makeID : ->
		crypto.randomBytes(6).toString 'base64'

	getSnapshots : (i, object, next) ->
		start = if i == 0 then 0 else object.position 									#assume everything before the first tag as part of the first object 
		end = if typeof next == 'undefined' then fullText.length else next.position		#assume everything after the last tag as part of the last object  
		newSnapshot = fullText.substring(start, end)
		object.snapshot = newSnapshot
		return

		  
