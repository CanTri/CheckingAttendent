import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';

import { SharedModule } from '../shared/shared.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { StudentsModule } from '../students/students.module';
import { CoursesModule } from '../courses/courses.module';
import { TeachersModule } from '../teachers/teachers.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { AbsenceRequestsModule } from '../absence-requests/absence-requests.module';
import { FeedbackModule } from '../feedback/feedback.module';

import { AuthGuardService } from '../shared/shared.module';
const ROUTES = [{
    path: '',
    component: LayoutComponent,
    canActivateChild: [AuthGuardService],
    children: [
        { path: '', loadChildren: 'app/dashboard/dashboard.module#DashboardModule' },
        { path: 'courses', loadChildren: 'app/courses/courses.module#CoursesModule' },
        { path: 'students', loadChildren: 'app/students/students.module#StudentsModule' },
        { path: 'teachers', loadChildren: 'app/teachers/teachers.module#TeachersModule' },
        { path: 'schedule', loadChildren: 'app/schedule/schedule.module#ScheduleModule' },
        { path: 'absence-requests', loadChildren: 'app/absence-requests/absence-requests.module#AbsenceRequestsModule' },
        { path: 'feedbacks', loadChildren: 'app/feedback/feedback.module#FeedbackModule' },
        { path: 'settings', loadChildren: 'app/settings/setting.module#SettingModule' },
        { path: 'check-attendance', loadChildren: 'app/check-attendance/check-attendance.module#CheckAttendanceModule' },
        { path: 'check-attendance/quiz', loadChildren: 'app/check-attendance-quiz/check-attendance-quiz.module#CheckAttendanceQuizModule' },
        { path: 'quiz', loadChildren: 'app/quiz/quiz.module#QuizModule' },
        { path: 'change-password', component: ChangePasswordComponent },
    ]
}, ];
@NgModule({
    declarations: [
        LayoutComponent,
        ChangePasswordComponent
    ],
    imports: [
        FormsModule,
        HttpModule,
        SharedModule,
        // HomePageModule,
        // CoursesModule,
        //StudentsModule,
        //TeachersModule,
        //ScheduleModule,
        //AbsenceRequestsModule,
        //FeedbackModule,
        RouterModule.forChild(ROUTES),
    ],
    providers: [],
})

export class LayoutModule {}
