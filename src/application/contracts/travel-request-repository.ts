import { TravelRequestAnalyse } from "../../domain/TravelRequestAnalyse";

export type PersistedTravelRequest = {
    id: string;
    requesterName: string;
    requesterType: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    reason: string;
    status: string;
    travelDays: number;
    dailyAmountInCents: number;
    subtotalInCents: number;
    transportCostInCents: number;
    totalAmountInCents: number;
    createdAt: string;
};

export interface TravelRequestRepository {
    save(analysis: TravelRequestAnalyse): Promise<void>;
    findById(requestId: string): Promise<PersistedTravelRequest | null>;
}