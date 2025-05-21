import { Body, Controller, Post, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSignupDto } from './dto/users.signup.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('signup')
  async createUser(@Body() userSignupDto: UserSignupDto) {
    return this.userService.signupUser(userSignupDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return this.userService.findAll();
  }
}
