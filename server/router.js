// const some = require('./controllers/some');

module.exports = (app) => {
  // I should have used query params and only one controller function for this
  // the params would have been used as filters on the query
  // However I am following the instructions
  app.get('/', (req, res) => res.status(200).send({ ok: true }));
};
