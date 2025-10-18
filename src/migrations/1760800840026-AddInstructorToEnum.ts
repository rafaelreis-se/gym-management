import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstructorToEnum1760800840026 implements MigrationInterface {
  name = 'AddInstructorToEnum1760800840026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar o valor 'instructor' ao enum existente
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE 'instructor'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL não permite remover valores de enum diretamente
    // Seria necessário recriar o enum sem o valor
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'guardian', 'student')`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student'`
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
  }
}
