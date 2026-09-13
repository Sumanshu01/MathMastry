import app from './app.js';
import db from './db/knex.js';

const PORT = process.env.PORT || 5000;

// Test DB connection before starting server
db.raw('SELECT 1')
  .then(() => {
    console.log('PostgreSQL database connected successfully.');
    app.listen(PORT, () => {
      console.log(`MathMastry Backend Server is running on port ${PORT}`);
      console.log(`API base endpoint: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL database:', err.message);
    process.exit(1);
  });
