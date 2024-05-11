import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-get-reason-rejected',
  templateUrl: './dialog-get-reason-rejected.component.html',
  styleUrls: ['./dialog-get-reason-rejected.component.scss']
})
export class DialogGetReasonRejectedComponent {
  reasonRejected: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {name: string},
    public dialogRef: MatDialogRef<DialogGetReasonRejectedComponent>
  ) {

  }

  submitOpinion() {
    this.dialogRef.close(this.reasonRejected);
  }

  cancelOpinion() {
    this.dialogRef.close();
  }
}