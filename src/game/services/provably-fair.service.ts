import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ProvablyFairService {
  /**
   * Generate a random server seed
   */
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a random client seed
   */
  generateClientSeed(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate hash from server seed
   */
  generateHash(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Calculate crash point using provably fair algorithm
   * Based on Bustabit's algorithm
   * 
   * @param serverSeed - Server seed
   * @param clientSeed - Client seed (optional)
   * @param nonce - Round number
   * @param houseEdge - House edge (default 1%)
   * @returns Crash point multiplier
   */
  calculateCrashPoint(
    serverSeed: string,
    clientSeed: string = '0',
    nonce: number = 0,
    houseEdge: number = 0.01,
  ): number {
    // Combine seeds with nonce
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    
    // Generate hash
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    // Take first 52 bits (13 hex characters)
    const hexSubstring = hash.substring(0, 13);
    const intValue = parseInt(hexSubstring, 16);
    
    // Calculate crash point
    // Using formula: 99 / (1 - X) where X is normalized hash value
    const maxValue = Math.pow(2, 52);
    
    // Edge case: if intValue is 0, crash at 1.00x
    if (intValue === 0) {
      return 1.00;
    }
    
    // Calculate with house edge
    const normalizedValue = intValue / maxValue;
    const crashPoint = (99 / (1 - normalizedValue)) * (1 - houseEdge);
    
    // Round to 2 decimal places and ensure minimum 1.00x
    return Math.max(1.00, Math.floor(crashPoint * 100) / 100);
  }

  /**
   * Verify crash point calculation
   * Allows players to verify game fairness
   */
  verifyCrashPoint(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    expectedCrashPoint: number,
    houseEdge: number = 0.01,
  ): boolean {
    const calculated = this.calculateCrashPoint(serverSeed, clientSeed, nonce, houseEdge);
    return Math.abs(calculated - expectedCrashPoint) < 0.01; // Allow 0.01 tolerance
  }

  /**
   * Calculate current multiplier based on elapsed time
   * Uses exponential growth formula
   * 
   * @param elapsedMs - Milliseconds since round start
   * @returns Current multiplier
   */
  calculateMultiplier(elapsedMs: number): number {
    // Formula: 1.00 * e^(0.00006 * t)
    // This gives smooth exponential growth
    const growth = 0.00006;
    const multiplier = Math.pow(Math.E, growth * elapsedMs);
    
    // Round to 2 decimal places
    return Math.floor(multiplier * 100) / 100;
  }

  /**
   * Calculate time needed to reach specific multiplier
   * Inverse of calculateMultiplier
   */
  calculateTimeForMultiplier(targetMultiplier: number): number {
    const growth = 0.00006;
    return Math.log(targetMultiplier) / growth;
  }
}
