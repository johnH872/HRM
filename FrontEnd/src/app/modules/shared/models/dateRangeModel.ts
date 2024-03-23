import { prop } from "@rxweb/reactive-form-validators";

export class DateRangeModel {
    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
    }
    @prop()
    start: Date;
    @prop()
    end: Date;
}
