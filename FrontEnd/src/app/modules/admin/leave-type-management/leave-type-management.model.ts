import { NumericValueType, numeric, prop } from '@rxweb/reactive-form-validators';

export class LeaveTypeModel {
    @prop()
    leaveTypeId: number;
    @prop()
    leaveTypeName: string;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    defaultStartDay: number;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    defaultStartMonth: number;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    defaultEndDay: number;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    defaultEndMonth: number;
    @prop()
    @numeric({ acceptValue: NumericValueType.PositiveNumber, message: 'Only numberic is allowed' })
    defaultBudget: number;
    @prop()
    isPaidSalary: boolean;
}