import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '@gym-management/domain';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole, AuthProvider } from '@gym-management/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue({
        id: '1',
        ...registerDto,
        passwordHash: 'hashedPassword',
      });
      mockUserRepository.save.mockResolvedValue({
        id: '1',
        ...registerDto,
        passwordHash: 'hashedPassword',
      });

      const result = await service.register(registerDto);

      expect(result.email).toBe(registerDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        registerDto.password
      );
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: '1',
        email,
        passwordHash: 'hashedPassword',
        authProvider: AuthProvider.LOCAL,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockPasswordService.comparePassword.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(user);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(
        password,
        user.passwordHash
      );
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockPasswordService.comparePassword.mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword'
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        passwordHash: 'hashedPassword',
        isActive: true,
        isFirstAccess: false,
        lastLoginAt: null,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockUserRepository.save.mockResolvedValue(user);
      mockTokenService.generateAccessToken.mockReturnValue('accessToken');
      mockTokenService.generateRefreshToken.mockResolvedValue({
        token: 'refreshToken',
      });

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('accessToken');
      expect(result.refreshToken).toBe('refreshToken');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
