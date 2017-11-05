import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { QuizTeacherComponent }    from './quiz-teacher.component';
import { TabsModule,AccordionModule ,PaginationModule } from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';
const studentsRoutes: Routes = [
  { path: '',  component: QuizTeacherComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(studentsRoutes),
    PaginationModule.forRoot(),
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    SharedModule
  ],
  declarations: [
    QuizTeacherComponent
  ],
  providers: []
})
export class QuizModule {}
