import { TravelRequestAnalyse } from "../../domain/TravelRequestAnalyse";

export interface TravelRequestRepository {
    save(analysis: TravelRequestAnalyse): Promise<void>;
}