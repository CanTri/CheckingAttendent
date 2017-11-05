import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CollapseModule } from 'ngx-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import { SettingComponent }    from './setting.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";

const Routes: Routes = [
  { path: '',  component: SettingComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(Routes),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule,
    FileUploadModule,
    TextMaskModule
  ],
  declarations: [
    SettingComponent,
  ],
  providers: []
})
export class SettingModule {}
