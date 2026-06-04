import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(() => {
    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn((payload) => payload as User),
      save: jest.fn(async (user) => ({
        ...user,
        id: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    jwtService = {
      sign: jest.fn(() => 'signed-jwt-token'),
    };

    service = new AuthService(
      usersRepository as unknown as Repository<User>,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a new user and returns a token', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    const result = await service.register({
      name: 'Jane Doe',
      email: 'Jane@Example.com',
      password: 'password123',
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
      }),
    );
    expect(result.accessToken).toBe('signed-jwt-token');
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'jane@example.com',
      name: 'Jane Doe',
    });
  });

  it('throws when email is already registered', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 'existing' } as User);

    await expect(
      service.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    usersRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      name: 'Jane Doe',
      passwordHash,
    } as User);

    const result = await service.login({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('signed-jwt-token');
    expect(result.user.email).toBe('jane@example.com');
  });

  it('rejects invalid login credentials', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'jane@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns profile for existing user', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      name: 'Jane Doe',
    } as User);

    await expect(service.getProfile('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'jane@example.com',
      name: 'Jane Doe',
    });
  });

  it('throws when profile user does not exist', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.getProfile('missing-user')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

});
