"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , _               = require('lodash')
  , rp              = require('request-promise')
  , urljoin         = require('url-join')
  , errors          = require('request-promise/errors')
  ;

const url = config.has('account')? config.getUrl('account') : undefined;

function issueTokenById(id, options = {}) {
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

function issueTokenByUsername(hostname, name, options = {}) {
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

function issueTokenBySecret(sub, secret, options = {}) {
  return Promise
          .resolve(rp.get({ url : urljoin(url || options.url, '/account', sub, 'secret', secret, '/token'), json : true }))
          .then((result) => {
            if (options.metadata) {
              return result;
            }

            return result.data;
          })
          .catch(errors.StatusCodeError, { statusCode : 404 }, (err) => {
            throw new Error('not found');
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not allowed');
          });
}

// todo [akamel] rename auth header from token to bearer
function findAccountById(sub, options = {}) {
  if (options.bearer) {
    options.token = options.bearer;
  }

  return Promise
          .resolve(rp.get({ url : urljoin(url || options.url, '/account', sub), json : true, headers : { authorization : options.token } }))
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

function findAccount(options = {}) {
  return Promise
          .resolve(rp.get({ url : urljoin(url || options.url, '/account'), json : true, headers : { authorization : options.bearer } }))
          .then((result) => {
            return result.data;
          })
          .catch(errors.StatusCodeError, { statusCode : 404 }, (err) => {
            throw new Error('not found');
          })
          .catch(errors.StatusCodeError, { statusCode : 401 }, (err) => {
            throw new Error('not authorized');
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not allowed');
          });
}

function reverseDNS(provider) {
  return _.chain(provider).split('.').reverse().join('.').value();
}

function findGitToken(options = {}) {
  return findAccount(options)
          .then((result) => {
            // temp until we stop stripping data out
            return { data : result };
          })
          .then((result) => {
            let account   = result.data
              , provider  = options.provider || account.provider
              , token     = _.get(account, `accounts.${reverseDNS(provider)}._token`);

            return { data : { token } };
          });
}

module.exports = {
    issueTokenById        : issueTokenById
  , issueTokenByUsername  : issueTokenByUsername
  , issueTokenBySecret    : issueTokenBySecret
  , findAccountById       : findAccountById
  , findAccount           : findAccount
  , findGitToken          : findGitToken
};
