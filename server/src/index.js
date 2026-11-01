import { app } from './app.js';
import { databasePath } from './db/index.js';

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Wortschatz API running at http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});
