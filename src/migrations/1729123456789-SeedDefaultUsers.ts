import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export class SeedDefaultUsers1729123456789 implements MigrationInterface {
  name = 'SeedDefaultUsers1729123456789';

  /**
   * Generate cryptographically secure passwords for default users
   * These passwords will only be shown once during migration
   */
  private generateSecurePasswords() {
    // Generate secure random passwords instead of hardcoded ones
    return {
      admin: this.generateSecurePassword('ADMIN'),
      instructor: this.generateSecurePassword('INSTRUCTOR'),
      student: this.generateSecurePassword('STUDENT'),
      guardian: this.generateSecurePassword('GUARDIAN'),
    };
  }

  /**
   * Generate a secure password for a specific role
   */
  private generateSecurePassword(role: string): string {
    // Use role prefix + secure random suffix for easier identification in dev
    const rolePrefix = role.toLowerCase();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    return `${rolePrefix}@${randomSuffix}!`;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔐 Generating secure passwords for default users...');

    // Generate secure passwords
    const passwords = this.generateSecurePasswords();

    // Hash passwords with bcrypt (cost factor 12 for security)
    const bcryptRounds = process.env['NODE_ENV'] === 'production' ? 12 : 10;

    const [adminHash, instructorHash, studentHash, guardianHash] =
      await Promise.all([
        bcrypt.hash(passwords.admin, bcryptRounds),
        bcrypt.hash(passwords.instructor, bcryptRounds),
        bcrypt.hash(passwords.student, bcryptRounds),
        bcrypt.hash(passwords.guardian, bcryptRounds),
      ]);

    // Insert users with parameterized queries to prevent SQL injection
    const users = [
      {
        email: 'admin@gym.local',
        passwordHash: adminHash,
        role: 'admin',
        password: passwords.admin,
      },
      {
        email: 'instructor@gym.local',
        passwordHash: instructorHash,
        role: 'instructor',
        password: passwords.instructor,
      },
      {
        email: 'student@gym.local',
        passwordHash: studentHash,
        role: 'student',
        password: passwords.student,
      },
      {
        email: 'guardian@gym.local',
        passwordHash: guardianHash,
        role: 'guardian',
        password: passwords.guardian,
      },
    ];

    // Insert each user individually with proper error handling
    for (const user of users) {
      try {
        await queryRunner.query(
          `
          INSERT INTO "users" (
            "id", 
            "email", 
            "passwordHash", 
            "role", 
            "authProvider", 
            "isFirstAccess", 
            "isActive", 
            "createdAt", 
            "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3,
            'local',
            false,
            true,
            NOW(),
            NOW()
          ) ON CONFLICT (email) DO NOTHING;
        `,
          [user.email, user.passwordHash, user.role]
        );

        console.log(`✅ Created ${user.role} user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to create ${user.role} user:`, error);
      }
    }

    // Display credentials (only in development)
    if (process.env['NODE_ENV'] !== 'production') {
      console.log('\n� DEVELOPMENT CREDENTIALS (Save these!):');
      console.log(
        '┌─────────────┬─────────────────────────┬─────────────────────────────┐'
      );
      console.log(
        '│ Role        │ Email                   │ Password                    │'
      );
      console.log(
        '├─────────────┼─────────────────────────┼─────────────────────────────┤'
      );

      for (const user of users) {
        const role = user.role.padEnd(11);
        const email = user.email.padEnd(23);
        const password = user.password.padEnd(27);
        console.log(`│ ${role} │ ${email} │ ${password} │`);
      }

      console.log(
        '└─────────────┴─────────────────────────┴─────────────────────────────┘'
      );
      console.log('\n⚠️  SECURITY NOTES:');
      console.log(
        '   • These passwords are randomly generated and securely hashed'
      );
      console.log('   • Change default passwords immediately in production');
      console.log('   • Use environment variables for production credentials');
      console.log('   • Consider removing default users in production\n');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Removing default development users...');

    const emails = [
      'admin@gym.local',
      'instructor@gym.local',
      'student@gym.local',
      'guardian@gym.local',
    ];

    for (const email of emails) {
      await queryRunner.query('DELETE FROM "user" WHERE email = $1', [email]);
      console.log(`❌ Removed user: ${email}`);
    }

    console.log('✅ Default users removed successfully');
  }
}
