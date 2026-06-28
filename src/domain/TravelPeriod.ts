export class TravelPeriod {
    private readonly departureDate: string;
    private readonly returnDate: string;
    private readonly travelDays: number = 0;
    private readonly errors: string[] = [];

    constructor(departureDate: string, returnDate: string) {
        this.departureDate = departureDate || "";
        this.returnDate = returnDate || "";

        this.validate();

        if (this.errors.length === 0) {
            this.travelDays = this.calculateDays();
        }
    }

    private validate(): void {
        if (!this.departureDate) this.errors.push("departureDate is required");
        if (!this.returnDate) this.errors.push("returnDate is required");

        if (this.errors.length > 0) return;

        const badStart = this.isBadDate(this.departureDate);
        const badEnd = this.isBadDate(this.returnDate);

        if (badStart) this.errors.push("departureDate must be a valid YYYY-MM-DD date");
        if (badEnd) this.errors.push("returnDate must be a valid YYYY-MM-DD date");

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
        return date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day;
    }

    private getDayMilliseconds(value: string): number {
        const chunks = value.split("-");
        return Date.UTC(Number(chunks[0]), Number(chunks[1]) - 1, Number(chunks[2]));
    }

    private calculateDays(): number {
        const startMs = this.getDayMilliseconds(this.departureDate);
        const endMs = this.getDayMilliseconds(this.returnDate);
        return Math.floor((endMs - startMs) / 86400000) + 1;
    }

    public getTravelDays(): number { return this.travelDays; }
    public getErrors(): string[] { return this.errors; }
}