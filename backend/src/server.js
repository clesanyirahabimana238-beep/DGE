const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`D&G E-Commerce API listening on port ${PORT}`);
});

module.exports = server;
