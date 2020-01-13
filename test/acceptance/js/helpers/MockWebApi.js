/* eslint-disable
    camelcase,
    handle-callback-err,
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MockWebApi;
const express = require("express");
const app = express();
const MAX_REQUEST_SIZE = 2*((2*1024*1024) + (64*1024));

module.exports = (MockWebApi = {
	docs: {},

	clearDocs() { return this.docs = {}; },

	insertDoc(project_id, doc_id, doc) {
		if (doc.version == null) { doc.version = 0; }
		if (doc.lines == null) { doc.lines = []; }
		doc.pathname = '/a/b/c.tex';
		return this.docs[`${project_id}:${doc_id}`] = doc;
	},

	setDocument(project_id, doc_id, lines, version, ranges, lastUpdatedAt, lastUpdatedBy, callback) {
		if (callback == null) { callback = function(error) {}; }
		const doc = this.docs[`${project_id}:${doc_id}`] || (this.docs[`${project_id}:${doc_id}`] = {});
		doc.lines = lines;
		doc.version = version;
		doc.ranges = ranges;
		doc.pathname = '/a/b/c.tex';
		doc.lastUpdatedAt = lastUpdatedAt;
		doc.lastUpdatedBy = lastUpdatedBy;
		return callback(null);
	},

	getDocument(project_id, doc_id, callback) {
		if (callback == null) { callback = function(error, doc) {}; }
		return callback(null, this.docs[`${project_id}:${doc_id}`]);
	},

	run() {
		app.get("/project/:project_id/doc/:doc_id", (req, res, next) => {
			return this.getDocument(req.params.project_id, req.params.doc_id, function(error, doc) {
				if (error != null) {
					return res.send(500);
				} else if (doc != null) {
					return res.send(JSON.stringify(doc));
				} else {
					return res.send(404);
				}
			});
		});

		app.post("/project/:project_id/doc/:doc_id", express.bodyParser({limit: MAX_REQUEST_SIZE}), (req, res, next) => {
			return MockWebApi.setDocument(req.params.project_id, req.params.doc_id, req.body.lines, req.body.version, req.body.ranges, req.body.lastUpdatedAt, req.body.lastUpdatedBy, function(error) {
				if (error != null) {
					return res.send(500);
				} else {
					return res.send(204);
				}
			});
		});

		return app.listen(3000, function(error) {
			if (error != null) { throw error; }
	}).on("error", function(error) {
			console.error("error starting MockWebApi:", error.message);
			return process.exit(1);
		});
	}
});

MockWebApi.run();

