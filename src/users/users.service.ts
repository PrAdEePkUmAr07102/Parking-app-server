import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { Repository } from 'typeorm';
import { UserSignupDto } from './dto/users.signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepo: Repository<UsersEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async signupUser(userSignupDto: UserSignupDto) {
    const { name, organizationName, phone, password } = userSignupDto;
    if (!name || !organizationName || !phone || !password) {
      throw new BadRequestException('All Fields Required');
    }

    const existingPhone = await this.userRepo.findOne({
      where: { phone: phone },
    });
    if (existingPhone) {
      throw new BadRequestException('Phone Already Exists ,Please Log-in');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const createUser = new UsersEntity();
    createUser.name = name;
    createUser.organizationName = organizationName;
    createUser.phone = phone;
    createUser.password = hashPassword;

    const savedUser = await this.userRepo.save(createUser);

    const payload = { sub: savedUser.id, phone: savedUser.phone };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = createUser;
    return {
      message: 'User Created Successfully',
      data: userWithoutPassword,
      access_token: token,
    };
  }

  async findByPhone(phone: string) {
    return await this.userRepo.findOne({ where: { phone: phone } });
  }
}
