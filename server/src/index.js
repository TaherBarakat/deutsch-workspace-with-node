import { app } from './app.js';
import { closeDatabase, databasePath } from './db/index.js';

const port = Number(process.env.PORT) || 4000;

const server = app.listen(port, () => {
  console.log(`Wortschatz API running at http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Saving and closing the database…`);

  server.close(() => {
    closeDatabase();
    process.exit(0);
  });

  // Do not let a stuck connection keep the process alive forever.
  setTimeout(() => {
    closeDatabase();
    process.exit(0);
  }, 4000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
