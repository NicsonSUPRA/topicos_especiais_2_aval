import { ProcessTravelRequestUseCase } from "./application/usecases/process-travel-request-usecase.js";
import { PostgresTravelRequestRepository } from "./infra/database/postgres-travel-request-repository.js";

export type RequesterType = "student" | "employee" | "professor" | "manager";
export type TravelRequestStatus = "approved" | "pending-review" | "rejected";

export type TravelRequestInput = {
  requestId: string;
  requesterName: string;
  requesterType: RequesterType;
  destination: string;
  departureDate: string;
  returnDate: string;
  reason: string;
  transportCostInCents: number;
};

export type TravelRequestOutput = {
  requestId: string;
  status: TravelRequestStatus;
  travelDays: number;
  dailyAmountInCents: number;
  subtotalInCents: number;
  totalAmountInCents: number;
  errors: string[];
  warnings: string[];
};

const travelRequestRepository = new PostgresTravelRequestRepository();
const processTravelRequestUseCase = new ProcessTravelRequestUseCase(travelRequestRepository);

// ATENÇÃO: Sem 'async' e retornando diretamente o DTO síncrono para os testes herdados
export function processTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  return processTravelRequestUseCase.execute(input);
}