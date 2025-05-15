import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @Matches(/^\d{6}$/, { message: 'Password must be exactly 6 digits' })
  password: string;
}
