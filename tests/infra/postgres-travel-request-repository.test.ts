import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { TravelRequestInput } from '../../src/main.js';
import { TravelRequestAnalyse } from '../../src/domain/TravelRequestAnalyse.js';
import type { PersistedTravelRequest } from '../../src/application/contracts/travel-request-repository.js';

// Mock the connection pool module before importing the repository
const mockQuery = vi.fn();
vi.mock('../../src/infra/database/connection-pool.js', () => ({
  getPool: () => ({
    query: mockQuery,
  }),
  closePool: vi.fn(),
}));

// Import the repository AFTER the mock is set up
const { PostgresTravelRequestRepository } = await import(
  '../../src/infra/database/postgres-travel-request-repository.js'
);

function makeInput(overrides: Partial<TravelRequestInput> = {}): TravelRequestInput {
  return {
    requestId: 'TR-TEST-001',
    requesterName: 'Test User',
    requesterType: 'employee',
    destination: 'Teresina',
    departureDate: '2026-08-10',
    returnDate: '2026-08-12',
    reason: 'Attend institutional technical meeting',
    transportCostInCents: 12000,
    ...overrides,
  };
}

describe('PostgresTravelRequestRepository (Infra)', () => {
  let repository: InstanceType<typeof PostgresTravelRequestRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PostgresTravelRequestRepository();
  });

  describe('save()', () => {
    it('calls pool.query with the correct INSERT SQL and parameters', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const analysis = new TravelRequestAnalyse(makeInput());
      await repository.save(analysis);

      expect(mockQuery).toHaveBeenCalledTimes(1);

      const [sql, params] = mockQuery.mock.calls[0];

      // The SQL should be an INSERT statement
      expect(sql).toMatch(/INSERT\s+INTO/i);

      // Parameters should include the analysis data
      expect(params).toContain(analysis.getRequestId());
      expect(params).toContain(analysis.getStatus());
      expect(params).toContain(analysis.getTravelDays());
      expect(params).toContain(analysis.getTotalAmountInCents());
    });

    it('passes all required fields as query parameters', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const input = makeInput({ requesterType: 'professor', transportCostInCents: 5000 });
      const analysis = new TravelRequestAnalyse(input);
      await repository.save(analysis);

      const [, params] = mockQuery.mock.calls[0];

      expect(params).toContain('TR-TEST-001');
      expect(params).toContain('approved');
      expect(params).toContain(analysis.getDailyAmountInCents());
      expect(params).toContain(analysis.getSubtotalInCents());
      expect(params).toContain(analysis.getTransportCostInCents());
    });
  });

  describe('findById()', () => {
    it('calls pool.query with the correct SELECT SQL and id parameter', async () => {
      const mockDbRow = {
        id: 'TR-TEST-001',
        requester_name: 'Test User',
        requester_type: 'employee',
        destination: 'Teresina',
        departure_date: '2026-08-10',
        return_date: '2026-08-12',
        reason: 'Attend institutional technical meeting',
        status: 'approved',
        travel_days: 3,
        daily_amount_in_cents: 18000,
        subtotal_in_cents: 54000,
        transport_cost_in_cents: 12000,
        total_amount_in_cents: 66000,
        created_at: '2026-08-01T10:00:00Z',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow], rowCount: 1 });

      const result = await repository.findById('TR-TEST-001');

      expect(mockQuery).toHaveBeenCalledTimes(1);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/SELECT/i);
      expect(params).toContain('TR-TEST-001');
    });

    it('returns null when no rows are found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.findById('TR-NONEXISTENT');

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('returns the correct PersistedTravelRequest when a row is found', async () => {
      const mockDbRow = {
        id: 'TR-TEST-002',
        requester_name: 'Ada Lovelace',
        requester_type: 'professor',
        destination: 'Campus Central',
        departure_date: '2026-10-05',
        return_date: '2026-10-08',
        reason: 'Participate in academic conference',
        status: 'approved',
        travel_days: 4,
        daily_amount_in_cents: 25000,
        subtotal_in_cents: 100000,
        transport_cost_in_cents: 34567,
        total_amount_in_cents: 134567,
        created_at: '2026-09-15T14:30:00Z',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow], rowCount: 1 });

      const result = await repository.findById('TR-TEST-002');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('TR-TEST-002');
      expect(result!.requesterName).toBe('Ada Lovelace');
      expect(result!.requesterType).toBe('professor');
      expect(result!.destination).toBe('Campus Central');
      expect(result!.departureDate).toBe('2026-10-05');
      expect(result!.returnDate).toBe('2026-10-08');
      expect(result!.reason).toBe('Participate in academic conference');
      expect(result!.status).toBe('approved');
      expect(result!.travelDays).toBe(4);
      expect(result!.dailyAmountInCents).toBe(25000);
      expect(result!.subtotalInCents).toBe(100000);
      expect(result!.transportCostInCents).toBe(34567);
      expect(result!.totalAmountInCents).toBe(134567);
      expect(result!.createdAt).toBe('2026-09-15T14:30:00Z');
    });
  });
});
