let dbReady = false;
let dbError = null;

function setDbReady(ready, error = null) {
  dbReady = ready;
  dbError = error;
}

function isDbReady() {
  return dbReady;
}

function getDbError() {
  return dbError;
}

module.exports = { setDbReady, isDbReady, getDbError };
