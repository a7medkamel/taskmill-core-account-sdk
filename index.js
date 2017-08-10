"use strict";

var Promise                   = require('bluebird')
  , config                    = require('config-url')
  , _                         = require('lodash')
  , rp                        = require('request-promise')
  , urljoin                   = require('url-join')
  , errors                    = require('request-promise/errors')
  , { URL, URLSearchParams }  = require('url')
  ;

const jsonwebtoken = require('jsonwebtoken');

const url = config.has('account')? config.getUrl('account') : undefined;

function issueTokenById(id, options = {}) {
  let base            = url || options.url
    , uri             = new URL(urljoin(base, '/account', id, '/token'))
    , search          = new URLSearchParams('')
    , { expires_in }  = options
    ;

  if (expires_in) {
    search.append('expires_in', expires_in);
  }

  uri.search = search;

  return rp
          .get({ url : uri.toString(), json : true })
          .promise()
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
  let base            = url || options.url
    , uri             = new URL(urljoin(base, '/account', hostname, name, '/token'))
    , search          = new URLSearchParams('')
    , { expires_in }  = options
    ;

  if (expires_in) {
    search.append('expires_in', expires_in);
  }

  uri.search = search;

  return rp
          .get({ url : uri.toString(), json : true })
          .promise()
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

// function issueTokenBySecret(sub, secret, options = {}) {
//   let base            = url || options.url
//     , uri             = new URL(urljoin(base, '/account', sub, 'secret', secret, '/token'))
//     , search          = new URLSearchParams('')
//     , { expires_in }  = options
//     ;
//
//   if (expires_in) {
//     search.append('expires_in', expires_in);
//   }
//
//   uri.search = search;
//
//   return rp
//           .get({ url : uri.toString(), json : true })
//           .promise()
//           .then((result) => {
//             if (options.metadata) {
//               return result;
//             }
//
//             return result.data;
//           })
//           .catch(errors.StatusCodeError, { statusCode : 404 }, (err) => {
//             throw new Error('not found');
//           })
//           .catch(errors.StatusCodeError, (err) => {
//             throw new Error('not allowed');
//           });
// }

function issueTokenByKey(key, options = {}) {
  let base            = url || options.url
    , uri             = new URL(urljoin(base, '/key', key))
    ;

  return rp
          .get({ url : uri.toString(), json : true })
          .promise()
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

  return rp
          .get({ url : urljoin(url || options.url, '/account', sub), json : true, headers : { authorization : options.token } })
          .promise()
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
  return rp
          .get({ url : urljoin(url || options.url, '/account'), json : true, headers : { authorization : options.bearer } })
          .promise()
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
            // todo [akamel] temp until we stop stripping data out
            return { data : result };
          })
          .then((result) => {
            let account   = result.data
              , provider  = options.provider || account.provider
              , token     = _.get(account, `accounts.${reverseDNS(provider)}._token`);

            return { data : { token } };
          });
}

function decode(jwt) {
  return jsonwebtoken.decode(jwt);
}

module.exports = {
    issueTokenById        : issueTokenById
  , issueTokenByUsername  : issueTokenByUsername
  // , issueTokenBySecret    : issueTokenBySecret
  , issueTokenByKey       : issueTokenByKey
  , findAccountById       : findAccountById
  , findAccount           : findAccount
  , findGitToken          : findGitToken
  , decode                : decode
};
