export class NotificationModel {
   notificationId: String | null;
   userId: String | null;
   type: String | null;
   isRead: boolean = false;
   title: String | null;
   content: String | null;
   redirectUrl: String | null;
   createdAt: Date;
}
