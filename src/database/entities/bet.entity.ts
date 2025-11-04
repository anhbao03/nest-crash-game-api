import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Round } from './round.entity';

export enum BetStatus {
  PENDING = 'pending',
  CASHED_OUT = 'cashed_out',
  LOST = 'lost',
}

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  roundId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cashoutMultiplier: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  payout: number;

  @Column({
    type: 'enum',
    enum: BetStatus,
    default: BetStatus.PENDING,
  })
  status: BetStatus;

  @Column({ type: 'timestamp', nullable: true })
  cashedOutAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.bets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Round, (round) => round.bets)
  @JoinColumn({ name: 'roundId' })
  round: Round;
}
