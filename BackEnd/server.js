import {server} from './src/app.js'
import 'dotenv/config';

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
})
