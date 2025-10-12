import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and number or special character',
  })
  password: string;
}

