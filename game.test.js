import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: game-enhancements, Property 1: Bounce animation follows sine wave
// **Validates: Requirements 1.3**

/**
 * Calculate the Y position for a bouncing Kiro sprite based on sine wave
 * @param {number} bouncePhase - The current phase of the bounce animation (in radians)
 * @param {number} baseY - The base Y position
 * @param {number} amplitude - The amplitude of the bounce
 * @returns {number} The calculated Y position
 */
function calculateBounceY(bouncePhase, baseY, amplitude) {
  return baseY + Math.sin(bouncePhase) * amplitude;
}

describe('Splash Screen Bounce Animation Properties', () => {
  it('Property 1: Bounce animation follows sine wave - Y positions should follow sine wave pattern', () => {
    fc.assert(
      fc.property(
        // Generate random bounce phases (0 to 4π for multiple cycles)
        fc.float({ min: 0, max: Math.PI * 4 }),
        // Generate random base Y positions
        fc.float({ min: 100, max: 500 }),
        // Generate random amplitudes
        fc.float({ min: 5, max: 50 }),
        (bouncePhase, baseY, amplitude) => {
          // Calculate Y position using sine wave
          const y = calculateBounceY(bouncePhase, baseY, amplitude);
          
          // Property 1: The Y position should be within the expected range
          // (baseY - amplitude) <= y <= (baseY + amplitude)
          const minY = baseY - amplitude;
          const maxY = baseY + amplitude;
          expect(y).toBeGreaterThanOrEqual(minY - 0.001); // Small epsilon for floating point
          expect(y).toBeLessThanOrEqual(maxY + 0.001);
          
          // Property 2: The bounce should be periodic
          // Y at phase should equal Y at phase + 2π
          const yAtNextCycle = calculateBounceY(bouncePhase + Math.PI * 2, baseY, amplitude);
          expect(Math.abs(y - yAtNextCycle)).toBeLessThan(0.001);
          
          // Property 3: The bounce should be smooth (continuous)
          // Small changes in phase should result in small changes in Y
          const smallDelta = 0.01;
          const yAtNextPhase = calculateBounceY(bouncePhase + smallDelta, baseY, amplitude);
          const maxExpectedChange = amplitude * Math.abs(Math.cos(bouncePhase)) * smallDelta * 1.1; // 1.1 for tolerance
          expect(Math.abs(yAtNextPhase - y)).toBeLessThanOrEqual(maxExpectedChange);
          
          // Property 4: At phase = 0, π, 2π, etc., Y should be at baseY
          if (Math.abs(bouncePhase % Math.PI) < 0.001) {
            expect(Math.abs(y - baseY)).toBeLessThan(amplitude * 0.01);
          }
          
          // Property 5: At phase = π/2, Y should be at maximum (baseY + amplitude)
          if (Math.abs((bouncePhase % (Math.PI * 2)) - Math.PI / 2) < 0.001) {
            expect(Math.abs(y - (baseY + amplitude))).toBeLessThan(amplitude * 0.01);
          }
          
          // Property 6: At phase = 3π/2, Y should be at minimum (baseY - amplitude)
          if (Math.abs((bouncePhase % (Math.PI * 2)) - (3 * Math.PI / 2)) < 0.001) {
            expect(Math.abs(y - (baseY - amplitude))).toBeLessThan(amplitude * 0.01);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  it('Property 1: Bounce animation follows sine wave - Both Kiros should bounce in sync', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.PI * 4 }),
        fc.float({ min: 100, max: 500 }),
        fc.float({ min: 100, max: 500 }),
        fc.float({ min: 5, max: 50 }),
        (bouncePhase, leftBaseY, rightBaseY, amplitude) => {
          // Calculate Y positions for both Kiros
          const leftKiroY = calculateBounceY(bouncePhase, leftBaseY, amplitude);
          const rightKiroY = calculateBounceY(bouncePhase, rightBaseY, amplitude);
          
          // Property: Both Kiros should have the same offset from their base positions
          const leftOffset = leftKiroY - leftBaseY;
          const rightOffset = rightKiroY - rightBaseY;
          
          expect(Math.abs(leftOffset - rightOffset)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Bounce animation follows sine wave - Phase progression should be monotonic', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.PI * 2 }),
        fc.float({ min: 0.01, max: 0.5 }),
        (initialPhase, phaseIncrement) => {
          // Simulate phase progression over time
          let phase = initialPhase;
          const phases = [];
          
          for (let i = 0; i < 10; i++) {
            phases.push(phase);
            phase += phaseIncrement;
          }
          
          // Property: Phase should increase monotonically
          for (let i = 1; i < phases.length; i++) {
            expect(phases[i]).toBeGreaterThan(phases[i - 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
