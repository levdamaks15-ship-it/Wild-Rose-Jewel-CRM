import { initDb } from '../db.js';
import { seedDatabase } from '../seed.js';

const run = async () => {
  console.log('🚀 Running database migration and seeding...');
  await initDb();
  await seedDatabase();
  console.log('🎉 Migration completed successfully!');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
