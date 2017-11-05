import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';
import { Autosize } from 'angular2-autosize/angular2-autosize';
import { CollapseModule } from 'ngx-bootstrap';
import { CheckAttendanceQuizComponent } from './check-attendance-quiz.component'
import { CheckAttendanceQuizTeacherComponent } from './check-attendance-quiz-teacher/check-attendance-quiz-teacher.component'
import { CheckAttendanceQuizStudentComponent } from './check-attendance-quiz-student/check-attendance-quiz-student.component'
import { TooltipModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";
import { SharedModule } from '../shared/shared.module';
const Routes: Routes = [
  { path: '',  component: CheckAttendanceQuizComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(Routes),
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    SharedModule,
    TextMaskModule
  ],
  declarations: [
    CheckAttendanceQuizComponent,
    CheckAttendanceQuizStudentComponent,
    CheckAttendanceQuizTeacherComponent,
    Autosize
  ],
  providers: []
})

export class CheckAttendanceQuizModule {}
