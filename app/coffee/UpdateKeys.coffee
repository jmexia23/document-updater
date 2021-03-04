module.exports =
	combineProjectIdAndDocId: (project_id, doc_id) -> "#{project_id}:#{doc_id}"
	splitProjectIdAndDocId: (project_and_doc_id) -> project_and_doc_id.split(":")

	
	splitProjectIdAndDocIdAndClientId: (project_and_doc_id_and_client_id) -> project_and_doc_id_and_client_id.split(":")
	combineProjectIdAndDocIdAndClientId: (project_id, doc_id, client_id) -> "#{project_id}:#{doc_id}:#{client_id}"
	#vfc
