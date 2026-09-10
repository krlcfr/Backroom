import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/auth/rate-limit';

describe('Rate Limit Utility', () => {
  it('should allow requests below the maximum limit', () => {
    // Usamos un identificador único para no chocar con otras pruebas
    const identifier = 'test-ip-allow';
    const limit = 3;
    
    expect(checkRateLimit(identifier, limit).allowed).toBe(true); // Petición 1
    expect(checkRateLimit(identifier, limit).allowed).toBe(true); // Petición 2
    expect(checkRateLimit(identifier, limit).allowed).toBe(true); // Petición 3
  });

  it('should block requests that exceed the limit', () => {
    const identifier = 'test-ip-block';
    const limit = 2;
    
    expect(checkRateLimit(identifier, limit).allowed).toBe(true); // Petición 1
    expect(checkRateLimit(identifier, limit).allowed).toBe(true); // Petición 2
    
    // La petición 3 debe ser bloqueada (excede el límite de 2)
    const result3 = checkRateLimit(identifier, limit);
    expect(result3.allowed).toBe(false);
    expect(result3.retryAfter).toBeGreaterThan(0);
  });
});
