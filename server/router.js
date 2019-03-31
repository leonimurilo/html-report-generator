const reports = require('./controllers/reports');

module.exports = (app) => {
  // I should have used query params and only one controller function for this
  // the params would have been used as filters on the query
  // However I am following the instructions
  app.get('/', (req, res) => res.status(200).send({ ok: true }));
  app.post('/api/v1/report', (req, res) => {
    return reports.queue(req.body)
    .then(info => {
      return res.status(200).send({ message: 'success', ...info });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).send({ error: error.message });
    });
  });
};
