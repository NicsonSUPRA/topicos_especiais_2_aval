import { TravelRequestAnalyse } from "../../domain/TravelRequestAnalyse";
import { TravelRequestRepository } from "../contracts/travel-request-repository.js";
import { UseCase } from "../contracts/usecase.js";
import { ProcessTravelRequestInput, ProcessTravelRequestOutput } from "../dtos/travel-request-types.js";

export type ProcessTravelRequestUseCaseInterface = UseCase<ProcessTravelRequestInput, ProcessTravelRequestOutput>;

export class ProcessTravelRequestUseCase implements ProcessTravelRequestUseCaseInterface {
    constructor(
        private readonly travelRequestRepository: TravelRequestRepository
    ) { }

    // Retorna estritamente 'ProcessTravelRequestOutput' de forma síncrona
    execute(input: ProcessTravelRequestInput): ProcessTravelRequestOutput {
        const analysis = new TravelRequestAnalyse(input);

        // Salva no banco em background sem travar o fluxo síncrono exigido pelos testes
        this.travelRequestRepository.save(analysis).catch(err => {
            console.error("Database save failed in background:", err);
        });

        return {
            requestId: analysis.getRequestId(),
            status: analysis.getStatus(),
            travelDays: analysis.getTravelDays(),
            dailyAmountInCents: analysis.getDailyAmountInCents(),
            subtotalInCents: analysis.getSubtotalInCents(),
            totalAmountInCents: analysis.getTotalAmountInCents(),
            errors: analysis.getErrors(),
            warnings: analysis.getWarnings(),
        };
    }
}