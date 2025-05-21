import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(UsersEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a user if found and exclude password', async () => {
      const userId = 'some-uuid';
      const mockUser = { id: userId, name: 'Test User', phone: '1234567890', password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneById(userId);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual({ id: userId, name: 'Test User', phone: '1234567890' });
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-uuid';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(userId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('findAll', () => {
    it('should return an array of users and exclude passwords', async () => {
      const mockUsers = [
        { id: 'uuid1', name: 'User One', phone: '111', password: 'p1' },
        { id: 'uuid2', name: 'User Two', phone: '222', password: 'p2' },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'uuid1', name: 'User One', phone: '111' },
        { id: 'uuid2', name: 'User Two', phone: '222' },
      ]);
      result.forEach(user => expect(user.password).toBeUndefined());
    });

    it('should return an empty array if no users found', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
