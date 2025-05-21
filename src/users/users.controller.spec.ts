import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { NotFoundException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findOneById: jest.fn(),
    findAll: jest.fn(),
    signupUser: jest.fn(), // Added to mock all service methods used by controller
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const userId = 'some-uuid';
      const mockUser = { id: userId, name: 'Test User', phone: '1234567890' }; // Password already excluded by service
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(userId);
      expect(service.findOneById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-uuid';
      mockUsersService.findOneById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.getUserById(userId)).rejects.toThrow(NotFoundException);
      expect(service.findOneById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: 'uuid1', name: 'User One', phone: '111' },
        { id: 'uuid2', name: 'User Two', phone: '222' },
      ]; // Passwords already excluded by service
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array if no users are found', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.getAllUsers();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
