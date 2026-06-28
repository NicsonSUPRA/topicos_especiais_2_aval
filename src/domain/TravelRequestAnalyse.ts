import type { TravelRequestInput, TravelRequestStatus } from "../main.js";
import { TravelPeriod } from "./TravelPeriod.js";

export class TravelRequestAnalyse {
    private readonly requestId: string;
    private readonly requesterName: string;
    private readonly requesterType: string;
    private readonly destination: string;
    private readonly transportCostInCents: number;
    private readonly reason: string;

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
        this.requestId = input.requestId || "";
        this.requesterName = input.requesterName || "";
        this.requesterType = input.requesterType || "";
        this.destination = input.destination || "";
        this.transportCostInCents = input.transportCostInCents ?? 0;
        this.reason = input.reason || "";

        this.validateRequiredFields();

        const period = new TravelPeriod(input.departureDate || "", input.returnDate || "");
        this.errors.push(...period.getErrors());

        if (this.errors.length === 0) {
            this.travelDays = period.getTravelDays();
            this.dailyAmountInCents = TravelRequestAnalyse.DAILY_PRICES[this.requesterType] ?? 0;
            this.subtotalInCents = this.travelDays * this.dailyAmountInCents;
            this.totalAmountInCents = this.subtotalInCents + this.transportCostInCents;
            this.evaluateWarnings();
        }

        this.status = this.determineStatus();
    }

    private validateRequiredFields(): void {
        if (!this.requestId) this.errors.push("requestId is required");
        if (!this.requesterName) this.errors.push("requesterName is required");
        if (!this.requesterType) this.errors.push("requesterType is required");
        if (!this.destination) this.errors.push("destination is required");
    }

    private evaluateWarnings(): void {
        if (this.travelDays > 5 && this.reason.length < 30) {
            this.warnings.push("long travel requests should include a detailed reason");
        }
    }

    private determineStatus(): TravelRequestStatus {
        if (this.errors.length > 0) return "rejected";
        if (this.travelDays > 5 || this.totalAmountInCents > 200000) return "pending-review";
        return "approved";
    }

    public getRequestId(): string { return this.requestId; }
    public getTravelDays(): number { return this.travelDays; }
    public getDailyAmountInCents(): number { return this.dailyAmountInCents; }
    public getSubtotalInCents(): number { return this.subtotalInCents; }
    public getTotalAmountInCents(): number { return this.totalAmountInCents; }
    public getWarnings(): string[] { return this.warnings; }
    public getStatus(): TravelRequestStatus { return this.status; }
    public getErrors(): string[] { return this.errors; }
}