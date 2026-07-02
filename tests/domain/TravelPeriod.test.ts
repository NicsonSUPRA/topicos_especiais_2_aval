import { describe, expect, it } from 'vitest';
import { TravelPeriod } from '../../src/domain/TravelPeriod.js';

describe('TravelPeriod (Domain)', () => {
  describe('valid period calculations', () => {
    it('calculates 3 days for a multi-day period (2026-08-10 to 2026-08-12)', () => {
      const period = new TravelPeriod('2026-08-10', '2026-08-12');

      expect(period.getTravelDays()).toBe(3);
      expect(period.getErrors()).toEqual([]);
    });

    it('calculates 1 day for a single-day trip (same departure and return)', () => {
      const period = new TravelPeriod('2026-09-01', '2026-09-01');

      expect(period.getTravelDays()).toBe(1);
      expect(period.getErrors()).toEqual([]);
    });

    it('calculates correctly for a multi-week trip', () => {
      // 2026-07-01 to 2026-07-21 = 21 days
      const period = new TravelPeriod('2026-07-01', '2026-07-21');

      expect(period.getTravelDays()).toBe(21);
      expect(period.getErrors()).toEqual([]);
    });

    it('accepts a valid leap year date (2028-02-29)', () => {
      const period = new TravelPeriod('2028-02-28', '2028-02-29');

      expect(period.getTravelDays()).toBe(2);
      expect(period.getErrors()).toEqual([]);
    });

    it('returns no errors for valid dates', () => {
      const period = new TravelPeriod('2026-12-25', '2026-12-31');

      expect(period.getErrors()).toHaveLength(0);
      expect(period.getTravelDays()).toBe(7);
    });
  });

  describe('missing date validations', () => {
    it('returns an error when departureDate is an empty string', () => {
      const period = new TravelPeriod('', '2026-08-12');

      expect(period.getErrors()).toEqual(['departureDate is required']);
      expect(period.getTravelDays()).toBe(0);
    });

    it('returns an error when returnDate is an empty string', () => {
      const period = new TravelPeriod('2026-08-10', '');

      expect(period.getErrors()).toEqual(['returnDate is required']);
      expect(period.getTravelDays()).toBe(0);
    });

    it('returns both errors when both dates are missing', () => {
      const period = new TravelPeriod('', '');

      expect(period.getErrors()).toEqual([
        'departureDate is required',
        'returnDate is required',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });
  });

  describe('invalid date format validations', () => {
    it('rejects departureDate with wrong separator format (YYYY/MM/DD)', () => {
      const period = new TravelPeriod('2026/08/10', '2026-08-12');

      expect(period.getErrors()).toEqual([
        'departureDate must be a valid YYYY-MM-DD date',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });

    it('rejects returnDate with an invalid calendar date (2026-02-30)', () => {
      const period = new TravelPeriod('2026-08-10', '2026-02-30');

      expect(period.getErrors()).toEqual([
        'returnDate must be a valid YYYY-MM-DD date',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });

    it('rejects both dates when both have invalid formats', () => {
      const period = new TravelPeriod('2026/08/10', '2026-02-30');

      expect(period.getErrors()).toEqual([
        'departureDate must be a valid YYYY-MM-DD date',
        'returnDate must be a valid YYYY-MM-DD date',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });

    it('rejects an invalid leap year date (2027-02-29)', () => {
      const period = new TravelPeriod('2027-02-28', '2027-02-29');

      expect(period.getErrors()).toEqual([
        'returnDate must be a valid YYYY-MM-DD date',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });

    it('rejects departureDate with impossible month (2026-13-01)', () => {
      const period = new TravelPeriod('2026-13-01', '2026-12-31');

      expect(period.getErrors()).toEqual([
        'departureDate must be a valid YYYY-MM-DD date',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });

    it('rejects departureDate with impossible day (2026-04-31)', () => {
      const period = new TravelPeriod('2026-04-31', '2026-05-01');

      expect(period.getErrors()).toEqual([
        'departureDate must be a valid YYYY-MM-DD date',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });
  });

  describe('date ordering validation', () => {
    it('returns an error when returnDate is before departureDate', () => {
      const period = new TravelPeriod('2026-08-15', '2026-08-14');

      expect(period.getErrors()).toEqual([
        'returnDate cannot be before departureDate',
      ]);
      expect(period.getTravelDays()).toBe(0);
    });
  });

  describe('travel days is 0 when there are errors', () => {
    it('has 0 travel days when dates are missing', () => {
      const period = new TravelPeriod('', '');

      expect(period.getTravelDays()).toBe(0);
    });

    it('has 0 travel days when dates are invalid', () => {
      const period = new TravelPeriod('bad-date', '2026-08-12');

      expect(period.getTravelDays()).toBe(0);
    });

    it('has 0 travel days when return is before departure', () => {
      const period = new TravelPeriod('2026-10-10', '2026-10-05');

      expect(period.getTravelDays()).toBe(0);
    });
  });
});
