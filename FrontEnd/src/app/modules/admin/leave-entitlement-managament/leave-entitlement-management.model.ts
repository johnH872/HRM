import { NumericValueType, numeric, prop, required } from "@rxweb/reactive-form-validators";
import { LeaveTypeModel } from "../leave-type-management/leave-type-management.model";
import { EmployeeModel } from "../../shared/models/employee.model";

export class LeaveEntitlementModel {
    @prop()
    leaveEntitlementId: number;
    @prop()
    leaveTypeId: number;
    @prop()
    leaveType: LeaveTypeModel | null;
    @prop()
    userId: string;
    @prop()
    User: EmployeeModel | null;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    availableLeave: number;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    usableLeave: number;
    @prop()
    startDate: Date | string | null;
    @prop()
    endDate: Date | string | null;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    effectedYear: number;

    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    usedLeave: number;
    remainLeave: number;
}

export class LeaveEntitlementViewModel {
    totalAvailableLeave: number;
    totalUsableLeave: number;
    totalUsedLeave: number;
    totalRemain: number;
    leaveEntitlementLst: LeaveEntitlementModel[] | null;
    totalAvailableLeaveBonus: number;
    totalUsableLeaveBonus: number;
    totalUsedLeaveBonus: number;
    totalRemainBonus: number;
}

export class GenerateLeaveEntitlementModel {
    @prop()
    annuallyStart: Date | string | null;
    @prop()
    annuallyEnd: Date | string | null;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    annuallyBudget: number;
    @prop()
    seniorityStart: Date | string | null;
    @prop()
    seniorityEnd: Date | string | null;
    @prop()
    transferStart: Date | string | null;
    @prop()
    transferEnd: Date | string | null;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: true, message: 'Only numberic is allowed' })
    transferBudget: number;
    @prop()
    transferType: number[] = [];
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    effectedYear: number;
}