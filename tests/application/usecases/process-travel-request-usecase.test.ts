import { describe, it, expect, vi } from "vitest";
import { ProcessTravelRequestUseCase } from "../../../src/application/usecases/process-travel-request-usecase.js";
import type { TravelRequestRepository } from "../../../src/application/contracts/travel-request-repository.js";
import type { ProcessTravelRequestInput } from "../../../src/application/dtos/travel-request-types.js";

describe("ProcessTravelRequestUseCase", () => {
    it("should successfully orchestrate the flow of a valid travel request", () => {
        // 1. Cria um Mock simulando o contrato do repositório para não tocar no PostgreSQL real
        const mockRepository: TravelRequestRepository = {
            save: vi.fn().mockResolvedValue(undefined),
            findById: vi.fn().mockResolvedValue(null),
        };

        // 2. Instancia o caso de uso passando o mock criado
        const useCase = new ProcessTravelRequestUseCase(mockRepository);

        // 3. Define um input válido de exemplo
        const input: ProcessTravelRequestInput = {
            requestId: "req-usecase-test",
            requesterName: "Nicson Dev",
            requesterType: "professor",
            destination: "Campus Central",
            departureDate: "2026-08-10",
            returnDate: "2026-08-12",
            reason: "Participação em banca examinadora de TCC da instituição.",
            transportCostInCents: 45000,
        };

        // 4. Executa o caso de uso de forma síncrona
        const output = useCase.execute(input);

        // 5. Asserts: Valida se o output foi gerado corretamente pelas regras do domínio
        expect(output.requestId).toBe("req-usecase-test");
        expect(output.status).toBe("approved");
        expect(output.travelDays).toBe(3); // Contagem inclusiva (10, 11 e 12)
        expect(output.errors).toHaveLength(0);

        // 6. Arquitetura: Valida se o Caso de Uso chamou o método save do repositório em background
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should correctly handle an invalid travel request without crashing and log errors", () => {
        const mockRepository: TravelRequestRepository = {
            save: vi.fn().mockResolvedValue(undefined),
            findById: vi.fn().mockResolvedValue(null),
        };

        const useCase = new ProcessTravelRequestUseCase(mockRepository);

        // Input inválido (data de retorno anterior à de partida)
        const input: ProcessTravelRequestInput = {
            requestId: "req-invalid",
            requesterName: "John Doe",
            requesterType: "student",
            destination: "Local",
            departureDate: "2026-08-15",
            returnDate: "2026-08-10", // Errado
            reason: "Short reason",
            transportCostInCents: -10, // Errado
        };

        const output = useCase.execute(input);

        // Valida se o status mudou para rejeitado e se capturou os erros acumulados
        expect(output.status).toBe("rejected");
        expect(output.errors.length).toBeGreaterThan(0);

        // Mesmo com erros de validação, a arquitetura estipula que a tentativa de análise é salva
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
});