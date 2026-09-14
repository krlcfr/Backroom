import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('Endpoint: /api/health', () => {
  it('should return status 200 and { status: "ok" }', async () => {
    // Probamos el endpoint puramente sin simular nada (sin mocks)
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });
});
