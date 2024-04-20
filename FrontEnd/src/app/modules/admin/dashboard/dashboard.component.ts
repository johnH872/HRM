import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { NgxTableComponent } from '../../shared/components/ngx-table/ngx-table.component';
import { PaymentService } from './payment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  customers = [];
  columns = [];
  // products!: Product[];
  @ViewChild('ngxTable', { static: true }) ngxTable: NgxTableComponent;
  @ViewChild('userCell', { static: true }) userCell: TemplateRef<any>;
  @ViewChild('paymentTypeCell', { static: true }) paymentTypeCell: TemplateRef<any>;
  @ViewChild('workCell', { static: true }) workCell: TemplateRef<any>;
  private destroy$: Subject<void> = new Subject<void>();
  constructor(
    private paymentService: PaymentService,
    private messageService: MessageService,
    private dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
    this.columns = [
      {
        name: 'payerId',
        prop: 'payerId',
        cellTemplate: this.userCell
      },
      {
        name: 'workId',
        prop: 'workId',
        cellTemplate: this.workCell,
        cellClass: 'text-center'
      },
      {
        name: 'amount',
        prop: 'amount'
      },
      {
        name: 'Type',
        prop: 'paymentType',
        cellTemplate: this.paymentTypeCell
      },
      {
        name: 'createdAt',
        prop: 'createdAt'
      },
      {
        name: 'updatedAt',
        prop: 'updatedAt'
      },
    ];
    this.refreshData();

    this.customers =  [
        {
          id: "1000",
          code: "f230fh0g3",
          name: "Bamboo Watch",
          description: "Product Description",
          image: "bamboo-watch.jpg",
          "price": 65,
          "category": "Accessories",
          "quantity": 24,
          "inventoryStatus": "INSTOCK",
          "rating": 5
        },
        {
          "id": "1001",
          "code": "nvklal433",
          "name": "Black Watch",
          "description": "Product Description",
          "image": "black-watch.jpg",
          "price": 72,
          "category": "Accessories",
          "quantity": 61,
          "inventoryStatus": "INSTOCK",
          "rating": 4
        },
        {
          "id": "1002",
          "code": "zz21cz3c1",
          "name": "Blue Band",
          "description": "Product Description",
          "image": "blue-band.jpg",
          "price": 79,
          "category": "Fitness",
          "quantity": 2,
          "inventoryStatus": "LOWSTOCK",
          "rating": 3
        },
        {
          "id": "1003",
          "code": "244wgerg2",
          "name": "Blue T-Shirt",
          "description": "Product Description",
          "image": "blue-t-shirt.jpg",
          "price": 29,
          "category": "Clothing",
          "quantity": 25,
          "inventoryStatus": "INSTOCK",
          "rating": 5
        },
        {
          "id": "1004",
          "code": "h456wer53",
          "name": "Bracelet",
          "description": "Product Description",
          "image": "bracelet.jpg",
          "price": 15,
          "category": "Accessories",
          "quantity": 73,
          "inventoryStatus": "INSTOCK",
          "rating": 4
        },
        {
          "id": "1005",
          "code": "av2231fwg",
          "name": "Brown Purse",
          "description": "Product Description",
          "image": "brown-purse.jpg",
          "price": 120,
          "category": "Accessories",
          "quantity": 0,
          "inventoryStatus": "OUTOFSTOCK",
          "rating": 4
        },
        {
          "id": "1006",
          "code": "bib36pfvm",
          "name": "Chakra Bracelet",
          "description": "Product Description",
          "image": "chakra-bracelet.jpg",
          "price": 32,
          "category": "Accessories",
          "quantity": 5,
          "inventoryStatus": "LOWSTOCK",
          "rating": 3
        },
        {
          "id": "1007",
          "code": "mbvjkgip5",
          "name": "Galaxy Earrings",
          "description": "Product Description",
          "image": "galaxy-earrings.jpg",
          "price": 34,
          "category": "Accessories",
          "quantity": 23,
          "inventoryStatus": "INSTOCK",
          "rating": 5
        },
        {
          "id": "1008",
          "code": "vbb124btr",
          "name": "Game Controller",
          "description": "Product Description",
          "image": "game-controller.jpg",
          "price": 99,
          "category": "Electronics",
          "quantity": 2,
          "inventoryStatus": "LOWSTOCK",
          "rating": 4
        },
        {
          "id": "1009",
          "code": "cm230f032",
          "name": "Gaming Set",
          "description": "Product Description",
          "image": "gaming-set.jpg",
          "price": 299,
          "category": "Electronics",
          "quantity": 63,
          "inventoryStatus": "INSTOCK",
          "rating": 3
        }
      ]
  }

  refreshData(reset: boolean = false): void {
    // this.paymentService.getAllPayment().subscribe(e => {
    //   this.ngxTable.setData(e);
    // })
  }
}
