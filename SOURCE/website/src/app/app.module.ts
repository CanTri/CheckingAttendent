import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { FileUploadModule } from "ng2-file-upload";

import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { LogoutComponent } from './logout.component';
import { ForgotPasswordComponent } from './forgot-password.component';
import { SharedModule, PageNotFoundComponent, QRCodeComponent, AuthService, AuthGuardService } from './shared/shared.module';

const ROUTES = [
    { path: '', loadChildren: 'app/layout/layout.module#LayoutModule' }, 
    { path: 'login', component: LoginComponent},
    { path: 'logout', component: LogoutComponent},
    { path: 'forgot-password', component: ForgotPasswordComponent},
    { path: 'qr-code', component: QRCodeComponent },
    { path: '**', component: PageNotFoundComponent },

];

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        LogoutComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        FileUploadModule,
        SharedModule,
        RouterModule.forRoot(ROUTES), // Add routes to the app
    ],
    providers: [
        { provide: LOCALE_ID, useValue: "vi-VN" },
        AuthService, AuthGuardService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
