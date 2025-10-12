import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StudentsService } from './students.service';
import { GuardiansService } from '../guardians/guardians.service';
import { GraduationsService } from '../graduations/graduations.service';
import {
  Student,
  Guardian,
  StudentGuardian,
  Graduation,
} from '@gym-management/domain';
import { testDataSourceOptions } from '../../test-config/test-database.config';
import {
  AgeCategory,
  StudentStatus,
  GuardianRelationship,
  BeltColor,
  BeltDegree,
  Modality,
} from '@gym-management/common';

describe('Students Integration Tests', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let studentsService: StudentsService;
  let guardiansService: GuardiansService;
  let graduationsService: GraduationsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDataSourceOptions),
        TypeOrmModule.forFeature([
          Student,
          Guardian,
          StudentGuardian,
          Graduation,
        ]),
      ],
      providers: [StudentsService, GuardiansService, GraduationsService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    studentsService = module.get<StudentsService>(StudentsService);
    guardiansService = module.get<GuardiansService>(GuardiansService);
    graduationsService = module.get<GraduationsService>(GraduationsService);
  });

  afterEach(async () => {
    // Clean up database after each test
    await dataSource.getRepository(StudentGuardian).delete({});
    await dataSource.getRepository(Graduation).delete({});
    await dataSource.getRepository(Student).delete({});
    await dataSource.getRepository(Guardian).delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe('Student Registration - Adult (Self-Responsible)', () => {
    it('should create an adult student who is their own financial responsible', async () => {
      // Arrange: Adult student data
      const studentData = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678901',
        rg: '123456789',
        birthDate: new Date('1990-01-15'),
        phone: '11999999999',
        emergencyPhone: '11988888888',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        ageCategory: AgeCategory.ADULT,
        status: StudentStatus.ACTIVE,
      };

      // Act: Create student
      const student = await studentsService.create(studentData);

      // Assert: Student created successfully
      expect(student.id).toBeDefined();
      expect(student.fullName).toBe('João Silva');
      expect(student.cpf).toBe('12345678901');
      expect(student.ageCategory).toBe(AgeCategory.ADULT);

      // Verify student exists in database
      const foundStudent = await studentsService.findOne(student.id);
      expect(foundStudent.fullName).toBe('João Silva');
    });
  });

  describe('Student Registration - Child with Guardian', () => {
    it('should create a child student with a new guardian', async () => {
      // Arrange: Guardian and child data
      const guardianData = {
        fullName: 'Maria Silva (Mother)',
        email: 'maria@example.com',
        cpf: '98765432100',
        rg: '987654321',
        birthDate: new Date('1985-05-20'),
        phone: '11977777777',
        alternativePhone: '11966666666',
        address: 'Rua Família, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234000',
        profession: 'Professora',
      };

      const childData = {
        fullName: 'Pedro Silva (Filho)',
        email: 'pedro@example.com',
        cpf: '11122233344',
        birthDate: new Date('2015-03-10'),
        phone: '11977777777', // Same as guardian
        address: 'Rua Família, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234000',
        ageCategory: AgeCategory.CHILD,
        status: StudentStatus.ACTIVE,
      };

      // Act: Create guardian and student
      const guardian = await guardiansService.create(guardianData);
      const student = await studentsService.create(childData);

      // Link guardian to student
      const link = await guardiansService.linkToStudent({
        studentId: student.id,
        guardianId: guardian.id,
        relationship: GuardianRelationship.MOTHER,
        isFinanciallyResponsible: true,
        isEmergencyContact: true,
        canPickUp: true,
      });

      // Assert: Verify relationships
      expect(link.studentId).toBe(student.id);
      expect(link.guardianId).toBe(guardian.id);
      expect(link.isFinanciallyResponsible).toBe(true);

      // Verify guardian has the student linked
      const guardianWithStudents = await guardiansService.findOne(guardian.id);
      expect(guardianWithStudents.studentGuardians).toHaveLength(1);
      expect(guardianWithStudents.studentGuardians[0].student.fullName).toBe(
        'Pedro Silva (Filho)'
      );

      // Verify financially responsible
      const financiallyResponsible =
        await guardiansService.findFinanciallyResponsible(student.id);
      expect(financiallyResponsible).toHaveLength(1);
      expect(financiallyResponsible[0].fullName).toBe('Maria Silva (Mother)');
    });

    it('should reuse existing guardian when registering second child', async () => {
      // Arrange: Create guardian and first child
      const guardianData = {
        fullName: 'Carlos Santos (Father)',
        email: 'carlos@example.com',
        cpf: '55566677788',
        phone: '11955555555',
        address: 'Rua Dois Filhos, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01111000',
      };

      const firstChild = {
        fullName: 'Ana Santos (Filha 1)',
        email: 'ana@example.com',
        cpf: '22233344455',
        birthDate: new Date('2014-06-15'),
        phone: '11955555555',
        address: 'Rua Dois Filhos, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01111000',
        ageCategory: AgeCategory.CHILD,
        status: StudentStatus.ACTIVE,
      };

      const secondChild = {
        fullName: 'Lucas Santos (Filho 2)',
        email: 'lucas@example.com',
        cpf: '33344455566',
        birthDate: new Date('2016-08-20'),
        phone: '11955555555',
        address: 'Rua Dois Filhos, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01111000',
        ageCategory: AgeCategory.CHILD,
        status: StudentStatus.ACTIVE,
      };

      // Act: Create guardian and first child
      const guardian = await guardiansService.create(guardianData);
      const student1 = await studentsService.create(firstChild);
      await guardiansService.linkToStudent({
        studentId: student1.id,
        guardianId: guardian.id,
        relationship: GuardianRelationship.MOTHER,
        isFinanciallyResponsible: true,
        isEmergencyContact: true,
        canPickUp: true,
      });

      // Find existing guardian by CPF (simulating real-world scenario)
      const existingGuardian = await guardiansService.findByCpf('55566677788');
      expect(existingGuardian).toBeDefined();
      expect(existingGuardian?.id).toBe(guardian.id);

      // Create second child and link to same guardian
      const student2 = await studentsService.create(secondChild);
      await guardiansService.linkToStudent({
        studentId: student2.id,
        guardianId: existingGuardian!.id,
        relationship: GuardianRelationship.MOTHER,
        isFinanciallyResponsible: true,
        isEmergencyContact: true,
        canPickUp: true,
      });

      // Assert: Verify guardian has both children
      const guardianWithChildren = await guardiansService.findOne(guardian.id);
      expect(guardianWithChildren.studentGuardians).toHaveLength(2);

      const childrenNames = guardianWithChildren.studentGuardians.map(
        (sg) => sg.student.fullName
      );
      expect(childrenNames).toContain('Ana Santos (Filha 1)');
      expect(childrenNames).toContain('Lucas Santos (Filho 2)');
    });

    it('should use findOrCreate helper method to avoid duplicate guardians', async () => {
      // Arrange
      const guardianData = {
        fullName: 'Patricia Lima',
        email: 'patricia@example.com',
        cpf: '99988877766',
        phone: '11944444444',
        address: 'Rua Helper, 321',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02222000',
      };

      // Act: Try to create guardian twice with same CPF
      const guardian1 = await guardiansService.findOrCreate(guardianData);
      const guardian2 = await guardiansService.findOrCreate(guardianData);

      // Assert: Should return same guardian
      expect(guardian1.id).toBe(guardian2.id);
      expect(guardian1.cpf).toBe('99988877766');

      // Verify only one guardian exists
      const allGuardians = await guardiansService.findAll();
      const patricias = allGuardians.filter((g) => g.cpf === '99988877766');
      expect(patricias).toHaveLength(1);
    });
  });

  describe('Student Graduation Registration', () => {
    it('should register a graduation for a student', async () => {
      // Arrange: Create student
      const studentData = {
        fullName: 'Roberto Alves',
        email: 'roberto@example.com',
        cpf: '44455566677',
        birthDate: new Date('1995-07-12'),
        phone: '11933333333',
        address: 'Rua Faixa, 555',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03333000',
        ageCategory: AgeCategory.ADULT,
        status: StudentStatus.ACTIVE,
      };

      const student = await studentsService.create(studentData);

      // Act: Register graduation (White belt to Blue belt)
      const graduation = await graduationsService.create({
        studentId: student.id,
        modality: Modality.JIU_JITSU,
        beltColor: BeltColor.BLUE,
        beltDegree: BeltDegree.NONE,
        graduationDate: new Date(),
        grantedBy: 'Professor Marcos',
        notes: 'Excelente evolução técnica',
      });

      // Assert: Graduation registered
      expect(graduation.id).toBeDefined();
      expect(graduation.studentId).toBe(student.id);
      expect(graduation.beltColor).toBe(BeltColor.BLUE);
      expect(graduation.modality).toBe(Modality.JIU_JITSU);

      // Verify graduation history
      const studentGraduations = await graduationsService.findByStudent(
        student.id
      );
      expect(studentGraduations).toHaveLength(1);
      expect(studentGraduations[0].beltColor).toBe(BeltColor.BLUE);
    });

    it('should track multiple graduations for a student', async () => {
      // Arrange: Create student
      const studentData = {
        fullName: 'Fernanda Costa',
        email: 'fernanda@example.com',
        cpf: '66677788899',
        birthDate: new Date('1992-11-08'),
        phone: '11922222222',
        address: 'Rua Evolução, 888',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04444000',
        ageCategory: AgeCategory.ADULT,
        status: StudentStatus.ACTIVE,
      };

      const student = await studentsService.create(studentData);

      // Act: Register multiple graduations
      await graduationsService.create({
        studentId: student.id,
        modality: Modality.JIU_JITSU,
        beltColor: BeltColor.WHITE,
        beltDegree: BeltDegree.DEGREE_4,
        graduationDate: new Date('2023-01-15'),
        grantedBy: 'Professor Marcos',
      });

      await graduationsService.create({
        studentId: student.id,
        modality: Modality.JIU_JITSU,
        beltColor: BeltColor.BLUE,
        beltDegree: BeltDegree.NONE,
        graduationDate: new Date('2024-01-15'),
        grantedBy: 'Professor Marcos',
      });

      // Assert: Track graduation history
      const graduations = await graduationsService.findByStudent(student.id);
      expect(graduations).toHaveLength(2);

      // Most recent should be Blue belt
      const current = await graduationsService.getCurrentGraduation(student.id);
      expect(current?.beltColor).toBe(BeltColor.BLUE);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle family with multiple children at different belt levels', async () => {
      // Arrange: Create family
      const guardianData = {
        fullName: 'Rafael Mendes (Pai)',
        email: 'rafael@example.com',
        cpf: '88899900011',
        phone: '11911111111',
        address: 'Rua Família BJJ, 999',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05555000',
      };

      const guardian = await guardiansService.create(guardianData);

      // Child 1: Teen
      const teen = await studentsService.create({
        fullName: 'Guilherme Mendes (Filho 1)',
        email: 'guilherme@example.com',
        cpf: '77788899900',
        birthDate: new Date('2010-03-15'),
        phone: '11911111111',
        address: 'Rua Família BJJ, 999',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05555000',
        ageCategory: AgeCategory.ADULT,
        status: StudentStatus.ACTIVE,
      });

      // Child 2: Child
      const child = await studentsService.create({
        fullName: 'Sofia Mendes (Filha 2)',
        email: 'sofia@example.com',
        cpf: '88899900022',
        birthDate: new Date('2015-07-20'),
        phone: '11911111111',
        address: 'Rua Família BJJ, 999',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05555000',
        ageCategory: AgeCategory.CHILD,
        status: StudentStatus.ACTIVE,
      });

      // Link both to guardian
      await guardiansService.linkToStudent({
        studentId: teen.id,
        guardianId: guardian.id,
        relationship: GuardianRelationship.MOTHER,
        isFinanciallyResponsible: true,
        isEmergencyContact: true,
        canPickUp: true,
      });

      await guardiansService.linkToStudent({
        studentId: child.id,
        guardianId: guardian.id,
        relationship: GuardianRelationship.MOTHER,
        isFinanciallyResponsible: true,
        isEmergencyContact: true,
        canPickUp: true,
      });

      // Register graduations
      await graduationsService.create({
        studentId: teen.id,
        modality: Modality.JIU_JITSU,
        beltColor: BeltColor.GREEN,
        beltDegree: BeltDegree.DEGREE_2,
        graduationDate: new Date(),
        grantedBy: 'Professor João',
      });

      await graduationsService.create({
        studentId: child.id,
        modality: Modality.JIU_JITSU,
        beltColor: BeltColor.YELLOW,
        beltDegree: BeltDegree.DEGREE_1,
        graduationDate: new Date(),
        grantedBy: 'Professor João',
      });

      // Assert: Verify complete family structure
      const guardianWithFamily = await guardiansService.findOne(guardian.id);
      expect(guardianWithFamily.studentGuardians).toHaveLength(2);

      const teenGraduation = await graduationsService.getCurrentGraduation(
        teen.id
      );
      expect(teenGraduation?.beltColor).toBe(BeltColor.GREEN);

      const childGraduation = await graduationsService.getCurrentGraduation(
        child.id
      );
      expect(childGraduation?.beltColor).toBe(BeltColor.YELLOW);
    });
  });
});

