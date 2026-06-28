import { describe, expect, it } from "vitest";
import { TravelRequest } from "../../src/domain/TravelRequest";
import type { RequesterType, TravelRequestInput } from "../../src/main.js";

// Função auxiliar idêntica à do professor (Fixture / Object Mother)
function makeInput(overrides: Partial<TravelRequestInput> = {}): TravelRequestInput {
    return {
        requestId: "TR-001",
        requesterName: "Ada Lovelace",
        requesterType: "employee",
        destination: "Teresina",
        departureDate: "2026-08-10",
        returnDate: "2026-08-12",
        reason: "Attend institutional technical meeting",
        transportCostInCents: 12000,
        ...overrides,
    };
}

describe("TravelRequestAnalyse (Domain)", () => {
    it("approves a simple valid travel request", () => {
        const travelRequest = new TravelRequest(makeInput());

        expect(travelRequest.getStatus()).toBe("approved");
        expect(travelRequest.getTravelDays()).toBe(3);
        expect(travelRequest.getDailyAmountInCents()).toBe(18000);
        expect(travelRequest.getSubtotalInCents()).toBe(54000);
        expect(travelRequest.getTotalAmountInCents()).toBe(66000);
        expect(travelRequest.getErrors()).toEqual([]);
        expect(travelRequest.getWarnings()).toEqual([]);
    });

    it("calculates travel days inclusively", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                departureDate: "2026-09-01",
                returnDate: "2026-09-01",
            }),
        );

        expect(travelRequest.getTravelDays()).toBe(1);
        expect(travelRequest.getSubtotalInCents()).toBe(18000);
    });

    it("uses the configured daily amount for each requester type", () => {
        const examples = [
            ["student", 9000],
            ["employee", 18000],
            ["professor", 25000],
            ["manager", 30000],
        ] satisfies Array<[RequesterType, number]>;

        for (const [requesterType, expectedDailyAmountInCents] of examples) {
            const travelRequest = new TravelRequest(makeInput({ requesterType }));

            expect(travelRequest.getDailyAmountInCents()).toBe(expectedDailyAmountInCents);
        }
    });

    it("calculates subtotal and total amounts", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                requesterType: "professor",
                departureDate: "2026-10-05",
                returnDate: "2026-10-08",
                transportCostInCents: 34567,
            }),
        );

        expect(travelRequest.getTravelDays()).toBe(4);
        expect(travelRequest.getSubtotalInCents()).toBe(100000);
        expect(travelRequest.getTotalAmountInCents()).toBe(134567);
    });

    it("marks travel requests longer than five days as pending review", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                departureDate: "2026-11-01",
                returnDate: "2026-11-06",
                reason: "Participate in a scheduled institutional workshop",
            }),
        );

        expect(travelRequest.getStatus()).toBe("pending-review");
        expect(travelRequest.getTravelDays()).toBe(6);
    });

    it("marks travel requests above BRL 2,000.00 as pending review", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                requesterType: "manager",
                departureDate: "2026-12-01",
                returnDate: "2026-12-05",
                transportCostInCents: 60000,
            }),
        );

        expect(travelRequest.getStatus()).toBe("pending-review");
        expect(travelRequest.getTotalAmountInCents()).toBe(210000);
    });

    it("adds a warning for long travel requests with a short reason", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                departureDate: "2027-01-10",
                returnDate: "2027-01-16",
                reason: "Meeting",
            }),
        );

        expect(travelRequest.getWarnings()).toEqual([
            "long travel requests should include a detailed reason",
        ]);
    });

    it("rejects requests with missing required fields", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                requestId: "",
                requesterName: "",
                requesterType: "" as RequesterType,
                destination: "",
                departureDate: "",
                returnDate: "",
            }),
        );

        expect(travelRequest.getStatus()).toBe("rejected");
        expect(travelRequest.getErrors()).toEqual([
            "requestId is required",
            "requesterName is required",
            "requesterType is required",
            "destination is required",
            "departureDate is required",
            "returnDate is required",
        ]);
    });

    it("rejects requests with invalid date formats", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                departureDate: "2026/08/10",
                returnDate: "2026-02-30",
            }),
        );

        expect(travelRequest.getStatus()).toBe("rejected");
        expect(travelRequest.getErrors()).toEqual([
            "departureDate must be a valid YYYY-MM-DD date",
            "returnDate must be a valid YYYY-MM-DD date",
        ]);
    });

    it("rejects requests when returnDate is before departureDate", () => {
        const travelRequest = new TravelRequest(
            makeInput({
                departureDate: "2026-08-15",
                returnDate: "2026-08-14",
            }),
        );

        expect(travelRequest.getStatus()).toBe("rejected");
        expect(travelRequest.getErrors()).toEqual(["returnDate cannot be before departureDate"]);
    });
});