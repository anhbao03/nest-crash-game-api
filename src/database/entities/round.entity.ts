import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Bet } from './bet.entity';

export enum RoundStatus {
  BETTING = 'betting',
  FLYING = 'flying',
  ENDED = 'ended',
}

@Entity('rounds')
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  roundNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  crashPoint: number;

  @Column({
    type: 'enum',
    enum: RoundStatus,
    default: RoundStatus.BETTING,
  })
  status: RoundStatus;

  @Column({ type: 'varchar', length: 255 })
  serverSeed: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientSeed: string;

  @Column({ type: 'varchar', length: 255 })
  hash: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Bet, (bet) => bet.round)
  bets: Bet[];
}
