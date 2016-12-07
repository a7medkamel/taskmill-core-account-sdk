"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , _               = require('lodash')
  , rp              = require('request-promise')
  , urljoin         = require('url-join')
  , errors          = require('request-promise/errors')
  ;

const url = config.has('account')? config.getUrl('account') : undefined;

function issueTokenById(id, options) {
  return Promise
          .resolve(rp.get({ url : urljoin(url || options.url, '/account', id, '/token'), json : true }))
          .then((result) => {
            return result.data;
          })
          .catch(errors.StatusCodeError, { statusCode : 404 }, (err) => {
            throw new Error('not found');
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not allowed');
          });
}

function issueTokenByUsername(hostname, name, options) {
  return Promise
          .resolve(rp.get({ url : urljoin(url || options.url, '/account', hostname, name, '/token'), json : true }))
          .then((result) => {
            return result.data;
          })
          .catch(errors.StatusCodeError, { statusCode : 404 }, (err) => {
            throw new Error('not found');
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not allowed');
          });
}

function findAccountById(sub, options) {
  return Promise
          .resolve(rp.get({ url : urljoin(url || options.url, '/account', sub), json : true }))
          .then((result) => {
            return result.data;
          })
          .catch(errors.StatusCodeError, { statusCode : 404 }, (err) => {
            throw new Error('not found');
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not allowed');
          });
}

module.exports = {
    issueTokenById        : issueTokenById
  , issueTokenByUsername  : issueTokenByUsername
  , findAccountById       : findAccountById
};