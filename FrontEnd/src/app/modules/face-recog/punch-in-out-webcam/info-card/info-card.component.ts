import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent {
  title: string = '';
  content: string = '';
  constructor(
    public dialModalRef: MatDialogRef<InfoCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data.title) this.title = data.title;
    if (data.content) this.content = data.content;
  }

  closeDialog() {
    this.dialModalRef.close(true);
  }
}
