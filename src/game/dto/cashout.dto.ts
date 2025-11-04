import { IsNotEmpty, IsUUID } from 'class-validator';

export class CashoutDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
