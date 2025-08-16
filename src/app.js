require('dotenv').config();
const express = require('express'); // core web framework
const helmet = require('helmet'); // secure HTTP headers
const cors = require('cors');
const morgan = require('morgan'); // logs HTTP requests
const routes = require('./routes');
const errorHandler = require('./middleware/error');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));
app.use(errorHandler);

module.exports = app;
