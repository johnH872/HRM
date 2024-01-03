import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
import route from './src/routes/indexRoutes.js';
import { Sequelize } from 'sequelize';
import dbConfigs from './config/db.config.js';

//database connection
const sequelize = new Sequelize(
    dbConfigs.development
)
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

//middleware
app.use(json());
app.use(cors());

//base route    
route(app);

// cron jobs
// outDateWork.start();

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
})
