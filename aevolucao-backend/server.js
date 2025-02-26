const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/autenticacao.js');
const trilhaRoutes = require('./routes/trilhas.js'); 
const connectDB = require('./db/db.js');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/trilhas', trilhaRoutes); 

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
