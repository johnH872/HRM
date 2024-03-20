import { NumericValueType, numeric, prop, required } from "@rxweb/reactive-form-validators";
import { LeaveEntitlementModel } from "../leave-entitlement-managament/leave-entitlement-management.model";
import { EmployeeModel } from "../../shared/models/employee.model";

export class LeaveRequestModel {
    @prop()
    leaveRequestId: number;
    @prop()
    userId: string;
    User: EmployeeModel | null;
    @prop()
    @required()
    leaveDateFrom: Date | string | null;
    @prop()
    @required()
    leaveDateTo: Date | string | null;
    @prop()
    @required()
    leaveEntitlementId: number;
    LeaveEntitlement: LeaveEntitlementModel | null;
    @prop()
    session: string;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    numberOfHour: number = 0;
    @prop()
    status: number;
    @prop()
    note: string;
    @prop()
    @required()
    reason: string;
    timeZone: number;

    ownerId: string;
    extendData: string;
}

export class LeaveBonusModel {
    @prop()
    leaveRequestId: number;
    @prop()
    lstProfileId: string[];
    @prop()
    leaveDateFrom: Date | string | null;
    @prop()
    leaveDateTo: Date | string | null;
    @prop()
    session: string;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    numberOfHour: number = 0;
    @prop()
    note: string;
    @prop()
    @required()
    title: string;
    timeZone: number;

    ownerId: string;
    extendData: string;
}