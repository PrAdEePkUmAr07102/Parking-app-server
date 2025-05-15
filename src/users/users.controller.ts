import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSignupDto } from './dto/users.signup.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('signup')
  async createUser(@Body() userSignupDto: UserSignupDto) {
    return this.userService.signupUser(userSignupDto);
  }
}
