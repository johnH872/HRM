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
    @prop()
    reasonRejected: string | null;

    timeZone: number;
    ownerId: string;
    extendData: string;
}