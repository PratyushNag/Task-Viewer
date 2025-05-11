import { generateId } from '../idUtils';

describe('idUtils', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });

    it('should include timestamp in the ID', () => {
      // Mock Date.now() to return a fixed timestamp
      const originalNow = Date.now;
      const mockTimestamp = 1620000000000; // Some fixed timestamp
      Date.now = jest.fn(() => mockTimestamp);

      const id = generateId();
      const timestampPart = mockTimestamp.toString(36);

      expect(id.startsWith(timestampPart)).toBe(true);

      // Restore original Date.now
      Date.now = originalNow;
    });

    it('should have the expected format (timestamp-random)', () => {
      const id = generateId();
      const parts = id.split('-');

      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });
  });
});
