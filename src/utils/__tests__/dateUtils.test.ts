import { formatDate, isToday, isThisWeek, isPast, getDaysBetween, getDeadlineColor } from '../dateUtils';

describe('dateUtils', () => {
  // Mock the current date for consistent testing
  const originalDate = global.Date;
  const mockDate = new Date('2023-05-15T12:00:00Z'); // Monday, May 15, 2023

  beforeAll(() => {
    global.Date = class extends Date {
      constructor(date?: string | number | Date) {
        if (date) {
          return new originalDate(date);
        }
        return new originalDate(mockDate);
      }
      static now() {
        return mockDate.getTime();
      }
    } as any;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  describe('formatDate', () => {
    it('should format a date to YYYY-MM-DD', () => {
      const date = new Date('2023-05-15T12:00:00Z');
      expect(formatDate(date)).toBe('2023-05-15');
    });

    it('should handle string dates', () => {
      expect(formatDate('2023-05-15T12:00:00Z')).toBe('2023-05-15');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date('2023-05-15T15:00:00Z');
      expect(isToday(today)).toBe(true);
    });

    it('should return false for other days', () => {
      const tomorrow = new Date('2023-05-16T12:00:00Z');
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isThisWeek', () => {
    it('should return true for dates in the current week', () => {
      // Monday to Sunday of the current week
      const monday = new Date('2023-05-15T12:00:00Z');
      const sunday = new Date('2023-05-21T12:00:00Z');
      
      expect(isThisWeek(monday)).toBe(true);
      expect(isThisWeek(sunday)).toBe(true);
    });

    it('should return false for dates outside the current week', () => {
      const lastWeek = new Date('2023-05-08T12:00:00Z');
      const nextWeek = new Date('2023-05-22T12:00:00Z');
      
      expect(isThisWeek(lastWeek)).toBe(false);
      expect(isThisWeek(nextWeek)).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2023-05-14T12:00:00Z');
      expect(isPast(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2023-05-16T12:00:00Z');
      expect(isPast(futureDate)).toBe(false);
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2023-05-15T12:00:00Z');
      const date2 = new Date('2023-05-20T12:00:00Z');
      
      expect(getDaysBetween(date1, date2)).toBe(5);
    });

    it('should handle string dates', () => {
      expect(getDaysBetween('2023-05-15T12:00:00Z', '2023-05-20T12:00:00Z')).toBe(5);
    });
  });

  describe('getDeadlineColor', () => {
    it('should return red for overdue dates', () => {
      const overdueDate = new Date('2023-05-14T12:00:00Z');
      expect(getDeadlineColor(overdueDate)).toBe('text-red-600 bg-red-100');
    });

    it('should return orange for dates due within 3 days', () => {
      const soonDate = new Date('2023-05-17T12:00:00Z'); // 2 days from mock date
      expect(getDeadlineColor(soonDate)).toBe('text-orange-600 bg-orange-100');
    });

    it('should return yellow for dates due within a week', () => {
      const weekDate = new Date('2023-05-20T12:00:00Z'); // 5 days from mock date
      expect(getDeadlineColor(weekDate)).toBe('text-yellow-600 bg-yellow-100');
    });

    it('should return green for dates due later than a week', () => {
      const laterDate = new Date('2023-05-30T12:00:00Z'); // 15 days from mock date
      expect(getDeadlineColor(laterDate)).toBe('text-green-600 bg-green-100');
    });
  });
});
