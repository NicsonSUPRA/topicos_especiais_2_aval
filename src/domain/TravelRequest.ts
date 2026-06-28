import type { TravelRequestInput, TravelRequestStatus } from "../main.js";

// Usando PascalCase conforme exigido pelo enunciado
export class TravelRequest {
    private readonly requestId: string;
    private readonly requesterName: string;
    private readonly requesterType: string;
    private readonly destination: string;
    private readonly departureDate: string;
    private readonly returnDate: string;
    private readonly transportCostInCents: number;
    private readonly reason: string;

    // Guardando os valores calculados uma única vez para evitar reprocessamento
    private readonly travelDays: number = 0;
    private readonly dailyAmountInCents: number = 0;
    private readonly subtotalInCents: number = 0;
    private readonly totalAmountInCents: number = 0;
    private readonly status: TravelRequestStatus;

    private readonly errors: string[] = [];
    private readonly warnings: string[] = [];

    private static readonly DAILY_PRICES: Record<string, number> = {
        student: 9000,
        employee: 18000,
        professor: 25000,
        manager: 30000,
    };

    constructor(input: TravelRequestInput) {
        // Garantindo fallback seguro para strings/valores caso venham nulos nos testes de erro
        this.requestId = input.requestId || "";
        this.requesterName = input.requesterName || "";
        this.requesterType = input.requesterType || "";
        this.destination = input.destination || "";
        this.departureDate = input.departureDate || "";
        this.returnDate = input.returnDate || "";
        this.transportCostInCents = input.transportCostInCents ?? 0;
        this.reason = input.reason || "";

        // 1. Valida os campos e popula a lista de erros
        this.validateFields();

        // 2. Se não houver erros, calcula os valores financeiros e de dias
        if (this.errors.length === 0) {
            this.travelDays = this.calculateTravelDays();
            this.dailyAmountInCents = TravelRequest.DAILY_PRICES[this.requesterType] ?? 0;
            this.subtotalInCents = this.travelDays * this.dailyAmountInCents;
            this.totalAmountInCents = this.subtotalInCents + this.transportCostInCents;

            // 3. Avalia os avisos (warnings) baseados nos dias calculados
            this.evaluateWarnings();
        }

        // 4. Determina o status final de forma definitiva
        this.status = this.determineStatus();
    }

    private validateFields(): void {
        if (!this.requestId) this.errors.push("requestId is required");
        if (!this.requesterName) this.errors.push("requesterName is required");
        if (!this.requesterType) this.errors.push("requesterType is required");
        if (!this.destination) this.errors.push("destination is required");
        if (!this.departureDate) this.errors.push("departureDate is required");
        if (!this.returnDate) this.errors.push("returnDate is required");

        let badStart = false;
        let badEnd = false;

        if (this.departureDate) {
            if (this.isBadDate(this.departureDate)) {
                this.errors.push("departureDate must be a valid YYYY-MM-DD date");
                badStart = true;
            }
        } else {
            badStart = true;
        }

        if (this.returnDate) {
            if (this.isBadDate(this.returnDate)) {
                this.errors.push("returnDate must be a valid YYYY-MM-DD date");
                badEnd = true;
            }
        } else {
            badEnd = true;
        }

        if (!badStart && !badEnd) {
            const startMs = this.getDayMilliseconds(this.departureDate);
            const endMs = this.getDayMilliseconds(this.returnDate);

            if (endMs < startMs) {
                this.errors.push("returnDate cannot be before departureDate");
            }
        }
    }

    private isBadDate(value: string): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;

        const chunks = value.split("-");
        const year = Number(chunks[0]);
        const month = Number(chunks[1]);
        const day = Number(chunks[2]);
        const date = new Date(Date.UTC(year, month - 1, day));

        return (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        );
    }

    private getDayMilliseconds(value: string): number {
        const chunks = value.split("-");
        return Date.UTC(Number(chunks[0]), Number(chunks[1]) - 1, Number(chunks[2]));
    }

    private calculateTravelDays(): number {
        const startMs = this.getDayMilliseconds(this.departureDate);
        const endMs = this.getDayMilliseconds(this.returnDate);
        return Math.floor((endMs - startMs) / 86400000) + 1;
    }

    private evaluateWarnings(): void {
        if (this.travelDays > 5 && this.reason.length < 30) {
            this.warnings.push("long travel requests should include a detailed reason");
        }
    }

    private determineStatus(): TravelRequestStatus {
        if (this.errors.length > 0) {
            return "rejected";
        }
        if (this.travelDays > 5 || this.totalAmountInCents > 200000) {
            return "pending-review";
        }
        return "approved";
    }

    // ---- GETTERS SEGUROS ----

    public getRequestId(): string { return this.requestId; }
    public getTravelDays(): number { return this.travelDays; }
    public getDailyAmountInCents(): number { return this.dailyAmountInCents; }
    public getSubtotalInCents(): number { return this.subtotalInCents; }
    public getTotalAmountInCents(): number { return this.totalAmountInCents; }
    public getWarnings(): string[] { return this.warnings; }
    public getStatus(): TravelRequestStatus { return this.status; }
    public getErrors(): string[] { return this.errors; }
}