import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS } from '@/lib/limits';

describe('Plan Limits', () => {
  it('should define free plan with 100MB storage', () => {
    expect(PLAN_LIMITS.free.storage_bytes).toBe(100 * 1024 * 1024);
  });

  it('should define enterprise plan with 500GB storage', () => {
    expect(PLAN_LIMITS.enterprise.storage_bytes).toBe(500 * 1024 * 1024 * 1024);
  });

  it('should allow more members in pro than free', () => {
    expect(PLAN_LIMITS.pro.max_members).toBeGreaterThan(PLAN_LIMITS.free.max_members);
  });
});
