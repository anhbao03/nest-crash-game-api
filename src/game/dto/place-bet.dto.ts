import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, Max } from 'class-validator';

export class PlaceBetDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(10, { message: 'Minimum bet is 10' })
  @Max(100000, { message: 'Maximum bet is 100000' })
  amount: number;
}
