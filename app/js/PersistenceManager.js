/* eslint-disable
    camelcase,
    handle-callback-err,
    no-unsafe-negation,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PersistenceManager
const Settings = require('settings-sharelatex')
const Errors = require('./Errors')
const Metrics = require('./Metrics')
const logger = require('logger-sharelatex')
const request = require('requestretry').defaults({
  maxAttempts: 2,
  retryDelay: 10
})

// We have to be quick with HTTP calls because we're holding a lock that
// expires after 30 seconds. We can't let any errors in the rest of the stack
// hold us up, and need to bail out quickly if there is a problem.
const MAX_HTTP_REQUEST_LENGTH = 5000 // 5 seconds

module.exports = PersistenceManager = {
  getDoc(project_id, doc_id, _callback) {
    if (_callback == null) {
      _callback = function(
        error,
        lines,
        version,
        ranges,
        pathname,
        projectHistoryId,
        projectHistoryType
      ) {}
    }
    const timer = new Metrics.Timer('persistenceManager.getDoc')
    const callback = function(...args) {
      timer.done()
      return _callback(...Array.from(args || []))
    }

    const url = `${Settings.apis.web.url}/project/${project_id}/doc/${doc_id}`
    return request(
      {
        url,
        method: 'GET',
        headers: {
          accept: 'application/json'
        },
        auth: {
          user: Settings.apis.web.user,
          pass: Settings.apis.web.pass,
          sendImmediately: true
        },
        jar: false,
        timeout: MAX_HTTP_REQUEST_LENGTH
      },
      function(error, res, body) {
        if (error != null) {
          return callback(error)
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            body = JSON.parse(body)
          } catch (e) {
            return callback(e)
          }
          if (body.lines == null) {
            return callback(new Error('web API response had no doc lines'))
          }
          if (body.version == null || !body.version instanceof Number) {
            return callback(
              new Error('web API response had no valid doc version')
            )
          }
          if (body.pathname == null) {
            return callback(
              new Error('web API response had no valid doc pathname')
            )
          }
          return callback(
            null,
            body.lines,
            body.version,
            body.ranges,
            body.pathname,
            body.projectHistoryId,
            body.projectHistoryType
          )
        } else if (res.statusCode === 404) {
          return callback(new Errors.NotFoundError(`doc not not found: ${url}`))
        } else {
          return callback(
            new Error(`error accessing web API: ${url} ${res.statusCode}`)
          )
        }
      }
    )
  },

  setDoc(
    project_id,
    doc_id,
    lines,
    version,
    ranges,
    lastUpdatedAt,
    lastUpdatedBy,
    _callback
  ) {
    if (_callback == null) {
      _callback = function(error) {}
    }
    const timer = new Metrics.Timer('persistenceManager.setDoc')
    const callback = function(...args) {
      timer.done()
      return _callback(...Array.from(args || []))
    }

    const url = `${Settings.apis.web.url}/project/${project_id}/doc/${doc_id}`
    return request(
      {
        url,
        method: 'POST',
        json: {
          lines,
          ranges,
          version,
          lastUpdatedBy,
          lastUpdatedAt
        },
        auth: {
          user: Settings.apis.web.user,
          pass: Settings.apis.web.pass,
          sendImmediately: true
        },
        jar: false,
        timeout: MAX_HTTP_REQUEST_LENGTH
      },
      function(error, res, body) {
        if (error != null) {
          return callback(error)
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          return callback(null)
        } else if (res.statusCode === 404) {
          return callback(new Errors.NotFoundError(`doc not not found: ${url}`))
        } else {
          return callback(
            new Error(`error accessing web API: ${url} ${res.statusCode}`)
          )
        }
      }
    )
  }
}
