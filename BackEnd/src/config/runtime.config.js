// Run migration automatically. Go to package.json and comment "nodemon --exec babel-node src/config/runtime.config.js &&" to block auto add migration
import { exec } from 'child_process';

(async () => {
    await new Promise((resolve, reject) => {
        const migrate = exec(
            'sequelize db:migrate',
            { env: process.env },
            (err, stdout, stderr) => {
                resolve();
            }
        );

        // Listen for the console.log message and kill the process to proceed to the next step in the npm script
        migrate.stdout.on('data', (data) => {
            console.log(data);
            if (data.indexOf('No migrations were executed, database schema was already up to date.') !== -1) {
                migrate.kill();
            }
        });
    });
})();