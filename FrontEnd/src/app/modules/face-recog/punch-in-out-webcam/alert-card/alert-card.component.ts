import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-card',
  templateUrl: './alert-card.component.html',
  styleUrls: ['./alert-card.component.scss']
})
export class AlertCardComponent implements OnInit {
  constructor(
    public dialModalRef: MatDialogRef<AlertCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { 

  }
  ngOnInit(): void {
    
  }
  closeDialog() {
    this.dialModalRef.close(false);
  }

  onClickReport() {
    this.dialModalRef.close(true);
  }
}
