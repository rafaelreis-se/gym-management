import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1729123456788 implements MigrationInterface {
  name = 'InitialSchema1760800336093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."plans_type_enum" RENAME TO "plans_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plans_type_enum" AS ENUM('monthly', 'quarterly', 'annual')`
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "type" TYPE "public"."plans_type_enum" USING "type"::"text"::"public"."plans_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."plans_type_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."plans_modalities_enum" RENAME TO "plans_modalities_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plans_modalities_enum" AS ENUM('bjj', 'muay_thai', 'mma', 'fitness')`
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "modalities" TYPE "public"."plans_modalities_enum"[] USING "modalities"::"text"::"public"."plans_modalities_enum"[]`
    );
    await queryRunner.query(`DROP TYPE "public"."plans_modalities_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'paid', 'cancelled')`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'`
    );
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payments_paymentmethod_enum" RENAME TO "payments_paymentmethod_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_paymentmethod_enum" AS ENUM('credit_card', 'debit_card', 'cash', 'pix')`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "paymentMethod" TYPE "public"."payments_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."payments_paymentmethod_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."payments_paymentmethod_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."enrollments_modality_enum" RENAME TO "enrollments_modality_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enrollments_modality_enum" AS ENUM('bjj', 'muay_thai', 'mma', 'fitness')`
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ALTER COLUMN "modality" TYPE "public"."enrollments_modality_enum" USING "modality"::"text"::"public"."enrollments_modality_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."enrollments_modality_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."graduations_modality_enum" RENAME TO "graduations_modality_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."graduations_modality_enum" AS ENUM('bjj', 'muay_thai', 'mma', 'fitness')`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "modality" TYPE "public"."graduations_modality_enum" USING "modality"::"text"::"public"."graduations_modality_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."graduations_modality_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."graduations_beltcolor_enum" RENAME TO "graduations_beltcolor_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."graduations_beltcolor_enum" AS ENUM('white', 'blue', 'purple', 'brown', 'black')`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltColor" TYPE "public"."graduations_beltcolor_enum" USING "beltColor"::"text"::"public"."graduations_beltcolor_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."graduations_beltcolor_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."graduations_beltdegree_enum" RENAME TO "graduations_beltdegree_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."graduations_beltdegree_enum" AS ENUM('0', '1', '2', '3', '4')`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltDegree" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltDegree" TYPE "public"."graduations_beltdegree_enum" USING "beltDegree"::"text"::"public"."graduations_beltdegree_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltDegree" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `DROP TYPE "public"."graduations_beltdegree_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."student_guardians_relationship_enum" RENAME TO "student_guardians_relationship_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_guardians_relationship_enum" AS ENUM('father', 'mother', 'guardian', 'other')`
    );
    await queryRunner.query(
      `ALTER TABLE "student_guardians" ALTER COLUMN "relationship" TYPE "public"."student_guardians_relationship_enum" USING "relationship"::"text"::"public"."student_guardians_relationship_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."student_guardians_relationship_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."students_status_enum" RENAME TO "students_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."students_status_enum" AS ENUM('active', 'inactive', 'suspended')`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "status" TYPE "public"."students_status_enum" USING "status"::"text"::"public"."students_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "status" SET DEFAULT 'active'`
    );
    await queryRunner.query(`DROP TYPE "public"."students_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."students_agecategory_enum" RENAME TO "students_agecategory_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."students_agecategory_enum" AS ENUM('kids', 'teens', 'adults')`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "ageCategory" TYPE "public"."students_agecategory_enum" USING "ageCategory"::"text"::"public"."students_agecategory_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."students_agecategory_enum_old"`
    );
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
    await queryRunner.query(
      `ALTER TYPE "public"."users_authprovider_enum" RENAME TO "users_authprovider_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_authprovider_enum" AS ENUM('local', 'google', 'facebook')`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" TYPE "public"."users_authprovider_enum" USING "authProvider"::"text"::"public"."users_authprovider_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" SET DEFAULT 'local'`
    );
    await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."products_category_enum" RENAME TO "products_category_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_category_enum" AS ENUM('equipment', 'apparel', 'supplements', 'accessories')`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "category" TYPE "public"."products_category_enum" USING "category"::"text"::"public"."products_category_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."products_category_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sales_paymentmethod_enum" RENAME TO "sales_paymentmethod_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sales_paymentmethod_enum" AS ENUM('credit_card', 'debit_card', 'cash', 'pix')`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentMethod" TYPE "public"."sales_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."sales_paymentmethod_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."sales_paymentmethod_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sales_paymentstatus_enum" RENAME TO "sales_paymentstatus_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sales_paymentstatus_enum" AS ENUM('pending', 'paid', 'cancelled')`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentStatus" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentStatus" TYPE "public"."sales_paymentstatus_enum" USING "paymentStatus"::"text"::"public"."sales_paymentstatus_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentStatus" SET DEFAULT 'paid'`
    );
    await queryRunner.query(
      `DROP TYPE "public"."sales_paymentstatus_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sales_paymentstatus_enum_old" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED')`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentStatus" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentStatus" TYPE "public"."sales_paymentstatus_enum_old" USING "paymentStatus"::"text"::"public"."sales_paymentstatus_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentStatus" SET DEFAULT 'PAID'`
    );
    await queryRunner.query(`DROP TYPE "public"."sales_paymentstatus_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sales_paymentstatus_enum_old" RENAME TO "sales_paymentstatus_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sales_paymentmethod_enum_old" AS ENUM('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_SLIP', 'PIX', 'BANK_TRANSFER')`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ALTER COLUMN "paymentMethod" TYPE "public"."sales_paymentmethod_enum_old" USING "paymentMethod"::"text"::"public"."sales_paymentmethod_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."sales_paymentmethod_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sales_paymentmethod_enum_old" RENAME TO "sales_paymentmethod_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_category_enum_old" AS ENUM('KIMONO', 'BELT', 'SHIRT', 'SHORTS', 'RASH_GUARD', 'SPATS', 'GLOVES', 'SHIN_GUARDS', 'ACCESSORIES', 'SUPPLEMENTS', 'OTHER')`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "category" TYPE "public"."products_category_enum_old" USING "category"::"text"::"public"."products_category_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."products_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."products_category_enum_old" RENAME TO "products_category_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_authprovider_enum_old" AS ENUM('LOCAL', 'GOOGLE', 'FACEBOOK', 'APPLE')`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" TYPE "public"."users_authprovider_enum_old" USING "authProvider"::"text"::"public"."users_authprovider_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" SET DEFAULT 'LOCAL'`
    );
    await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_authprovider_enum_old" RENAME TO "users_authprovider_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_old" AS ENUM('ADMIN', 'INSTRUCTOR', 'STUDENT', 'GUARDIAN')`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT'`
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."students_agecategory_enum_old" AS ENUM('CHILD', 'ADULT')`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "ageCategory" TYPE "public"."students_agecategory_enum_old" USING "ageCategory"::"text"::"public"."students_agecategory_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."students_agecategory_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."students_agecategory_enum_old" RENAME TO "students_agecategory_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."students_status_enum_old" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED')`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "status" TYPE "public"."students_status_enum_old" USING "status"::"text"::"public"."students_status_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
    await queryRunner.query(`DROP TYPE "public"."students_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."students_status_enum_old" RENAME TO "students_status_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_guardians_relationship_enum_old" AS ENUM('FATHER', 'MOTHER', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT', 'BROTHER', 'SISTER', 'LEGAL_GUARDIAN', 'OTHER')`
    );
    await queryRunner.query(
      `ALTER TABLE "student_guardians" ALTER COLUMN "relationship" TYPE "public"."student_guardians_relationship_enum_old" USING "relationship"::"text"::"public"."student_guardians_relationship_enum_old"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."student_guardians_relationship_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."student_guardians_relationship_enum_old" RENAME TO "student_guardians_relationship_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."graduations_beltdegree_enum_old" AS ENUM('NONE', 'DEGREE_1', 'DEGREE_2', 'DEGREE_3', 'DEGREE_4', 'DEGREE_5', 'DEGREE_6', 'DEGREE_7', 'DEGREE_8', 'DEGREE_9', 'DEGREE_10')`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltDegree" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltDegree" TYPE "public"."graduations_beltdegree_enum_old" USING "beltDegree"::"text"::"public"."graduations_beltdegree_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltDegree" SET DEFAULT 'NONE'`
    );
    await queryRunner.query(`DROP TYPE "public"."graduations_beltdegree_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."graduations_beltdegree_enum_old" RENAME TO "graduations_beltdegree_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."graduations_beltcolor_enum_old" AS ENUM('WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK', 'RED_BLACK', 'RED_WHITE', 'RED', 'GRAY_WHITE', 'GRAY', 'GRAY_BLACK', 'YELLOW_WHITE', 'YELLOW', 'YELLOW_BLACK', 'ORANGE_WHITE', 'ORANGE', 'ORANGE_BLACK', 'GREEN_WHITE', 'GREEN', 'GREEN_BLACK')`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "beltColor" TYPE "public"."graduations_beltcolor_enum_old" USING "beltColor"::"text"::"public"."graduations_beltcolor_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."graduations_beltcolor_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."graduations_beltcolor_enum_old" RENAME TO "graduations_beltcolor_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."graduations_modality_enum_old" AS ENUM('JIU_JITSU', 'MMA', 'MUAY_THAI', 'BOXING', 'WRESTLING', 'JUDO', 'OTHER')`
    );
    await queryRunner.query(
      `ALTER TABLE "graduations" ALTER COLUMN "modality" TYPE "public"."graduations_modality_enum_old" USING "modality"::"text"::"public"."graduations_modality_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."graduations_modality_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."graduations_modality_enum_old" RENAME TO "graduations_modality_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enrollments_modality_enum_old" AS ENUM('JIU_JITSU', 'MMA', 'MUAY_THAI', 'BOXING', 'WRESTLING', 'JUDO', 'OTHER')`
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ALTER COLUMN "modality" TYPE "public"."enrollments_modality_enum_old" USING "modality"::"text"::"public"."enrollments_modality_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."enrollments_modality_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."enrollments_modality_enum_old" RENAME TO "enrollments_modality_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_paymentmethod_enum_old" AS ENUM('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_SLIP', 'PIX', 'BANK_TRANSFER')`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "paymentMethod" TYPE "public"."payments_paymentmethod_enum_old" USING "paymentMethod"::"text"::"public"."payments_paymentmethod_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."payments_paymentmethod_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payments_paymentmethod_enum_old" RENAME TO "payments_paymentmethod_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum_old" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED')`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING'`
    );
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plans_modalities_enum_old" AS ENUM('JIU_JITSU', 'MMA', 'MUAY_THAI', 'BOXING', 'WRESTLING', 'JUDO', 'OTHER')`
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "modalities" TYPE "public"."plans_modalities_enum_old"[] USING "modalities"::"text"::"public"."plans_modalities_enum_old"[]`
    );
    await queryRunner.query(`DROP TYPE "public"."plans_modalities_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."plans_modalities_enum_old" RENAME TO "plans_modalities_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plans_type_enum_old" AS ENUM('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'CUSTOM')`
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "type" TYPE "public"."plans_type_enum_old" USING "type"::"text"::"public"."plans_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."plans_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."plans_type_enum_old" RENAME TO "plans_type_enum"`
    );
  }
}
