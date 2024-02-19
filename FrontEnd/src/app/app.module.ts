import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './token-intercreptor';
import { MatDialogModule } from '@angular/material/dialog';
import { NbAuthModule, NbDummyAuthStrategy } from '@nebular/auth';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent
    ],
    imports: [
        HttpClientModule,
        AppRoutingModule,
        AppLayoutModule,
        MatDialogModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        // Set up http intercepter
        PhotoService, ProductService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        // Setup nebular auth
        ...NbAuthModule.forRoot({
            strategies: [
                NbDummyAuthStrategy.setup({
                    name: 'email',
                    delay: 3000,
                }),
            ],
            forms: {
            },
        }).providers,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
