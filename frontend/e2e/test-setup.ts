import { execSync } from 'child_process';
import path from 'path';

/**
 * Resets the test database by dropping all objects and re-running Flyway migrations.
 *
 * Flyway 10+ removed `flyway:clean` from the OSS edition (now Teams-only),
 * so we use psql to drop/recreate the schema directly, then run `flyway:migrate`.
 */
export function resetDatabase() {
  const backendDir = path.resolve(__dirname, '../../backend');
  const dbHost = process.env.DB_HOST ?? 'localhost';
  const dbPort = '5434';
  const dbName = 'laundry_e2e_db';
  const dbUser = 'e2e_user';

  try {
    console.log('Resetting test database...');

    // Drop and recreate the public schema via psql
    execSync(
      `PGPASSWORD=e2e_password psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`,
      { cwd: backendDir, stdio: 'ignore' }
    );

    // Re-run Flyway migrations with the test profile
    execSync(
      'mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5434/laundry_e2e_db -Dflyway.user=e2e_user -Dflyway.password=e2e_password -Dflyway.locations=classpath:db/migration,classpath:db/seed/test -q',
      { cwd: backendDir, stdio: 'ignore' }
    );

    console.log('Database reset complete.');
  } catch (error) {
    console.error('Failed to reset database', error);
    throw error;
  }
}
