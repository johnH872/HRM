import { Component, OnDestroy, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { PaymentService } from '../payment.service';
import { PaymentHistory } from '../payment-history.model';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent {
  
}
