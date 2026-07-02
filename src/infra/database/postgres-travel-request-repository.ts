import {
    PersistedTravelRequest,
    TravelRequestRepository,
} from "../../application/contracts/travel-request-repository.js";
import { TravelRequestAnalyse } from "../../domain/TravelRequestAnalyse.js";
import { getPool } from "./connection-pool.js";

export class PostgresTravelRequestRepository implements TravelRequestRepository {
    async save(analysis: TravelRequestAnalyse): Promise<void> {
        const pool = getPool();

        const query = `
            INSERT INTO travel_requests (
                id,
                requester_name,
                requester_type,
                destination,
                departure_date,
                return_date,
                reason,
                status,
                travel_days,
                daily_amount_in_cents,
                subtotal_in_cents,
                transport_cost_in_cents,
                total_amount_in_cents,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
                requester_name = EXCLUDED.requester_name,
                requester_type = EXCLUDED.requester_type,
                destination = EXCLUDED.destination,
                departure_date = EXCLUDED.departure_date,
                return_date = EXCLUDED.return_date,
                reason = EXCLUDED.reason,
                status = EXCLUDED.status,
                travel_days = EXCLUDED.travel_days,
                daily_amount_in_cents = EXCLUDED.daily_amount_in_cents,
                subtotal_in_cents = EXCLUDED.subtotal_in_cents,
                transport_cost_in_cents = EXCLUDED.transport_cost_in_cents,
                total_amount_in_cents = EXCLUDED.total_amount_in_cents,
                created_at = EXCLUDED.created_at;
        `;

        const values = [
            analysis.getRequestId(),
            analysis.getRequesterName(),
            analysis.getRequesterType(),
            analysis.getDestination(),
            analysis.getDepartureDate(),
            analysis.getReturnDate(),
            analysis.getReason(),
            analysis.getStatus(),
            analysis.getTravelDays(),
            analysis.getDailyAmountInCents(),
            analysis.getSubtotalInCents(),
            analysis.getTransportCostInCents(),
            analysis.getTotalAmountInCents(),
            new Date().toISOString(),
        ];

        await pool.query(query, values);
    }

    async findById(requestId: string): Promise<PersistedTravelRequest | null> {
        const pool = getPool();

        const query = `
            SELECT
                id,
                requester_name,
                requester_type,
                destination,
                departure_date,
                return_date,
                reason,
                status,
                travel_days,
                daily_amount_in_cents,
                subtotal_in_cents,
                transport_cost_in_cents,
                total_amount_in_cents,
                created_at
            FROM travel_requests
            WHERE id = $1;
        `;

        const result = await pool.query(query, [requestId]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            requesterName: row.requester_name,
            requesterType: row.requester_type,
            destination: row.destination,
            departureDate: row.departure_date,
            returnDate: row.return_date,
            reason: row.reason,
            status: row.status,
            travelDays: row.travel_days,
            dailyAmountInCents: row.daily_amount_in_cents,
            subtotalInCents: row.subtotal_in_cents,
            transportCostInCents: row.transport_cost_in_cents,
            totalAmountInCents: row.total_amount_in_cents,
            createdAt: row.created_at,
        };
    }
}