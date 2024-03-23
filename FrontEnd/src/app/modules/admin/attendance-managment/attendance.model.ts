export class AttendanceModel {
    attendanceId: number;
    userId: string;
    punchinDate: Date;
    punchinTime: number;
    punchinNote: string;
    punchinOffset: number;
    punchoutDate: Date;
    punchoutTime: number;
    punchoutNote: string;
    punchoutOffset: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
