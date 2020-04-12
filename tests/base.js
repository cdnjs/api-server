const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const request = () => chai.request(`localhost:${Number(process.env.PORT || 5050)}`);

module.exports = request;
