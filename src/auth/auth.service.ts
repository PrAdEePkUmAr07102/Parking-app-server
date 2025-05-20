import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    if (!phone || !password) {
      throw new BadRequestException('All fields Required');
    }

    const existingUser = await this.userService.findByPhone(phone);
    if (!existingUser) {
      throw new BadRequestException('User Not Found');
    }
    const passwordIsMatch = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!passwordIsMatch) {
      throw new BadRequestException('Password Incorrect');
    }

    const payload = { sub: existingUser.id, phone: existingUser.phone };
    const token = await this.jwtService.sign(payload);

    return {
      message: 'Login Successfull',
      access_Token: token,
    };
  }
}
