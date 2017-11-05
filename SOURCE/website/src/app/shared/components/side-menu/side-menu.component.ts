import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
})
export class SideMenuComponent implements OnInit {

    public constructor(public  authService: AuthService, public  appService: AppService) {
        switch (authService.current_user.role_id) {
            case appService.userType.staff:
                this.sideMenu = this.staffMenu;
                break;
            case this.appService.userType.student:
                this.sideMenu = this.studentMenu;
                break;
            case this.appService.userType.teacher:
                this.sideMenu = this.teacherMenu;
                break;
        }
    }

    public ngOnInit() {}

    public sideMenu: Array < any > = [];

    public staffMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        { title: 'Students', url: '/students', icon: 'fa-users' },
        { title: 'Courses', url: '/courses', icon: 'fa-book' },
        { title: 'Teachers', url: '/teachers', icon: 'fa-graduation-cap' },
        { title: 'Schedule', url: '/schedule', icon: 'fa-calendar' },
        { title: 'Absence Requests', url: '/absence-requests', icon: 'fa-envelope' },
        { title: 'Feedbacks', url: '/feedbacks', icon: 'fa-comments' }, 
        // {
        //     title: 'Administration',
        //     url: '/administration',
        //     icon: 'fa-key',
        //     subMenu: [{ title: 'Users', url: '/administration/users' },
        //         { title: 'Activity Logs', url: '/administration/logs' }
        //     ]
        // },
        { title: 'Settings', url: '/settings', icon: 'fa-cog' },
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];

    public studentMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        { title: 'Attendance - Checklist',url: '/check-attendance',icon: 'fa-check-square-o' },
        { title: 'Attendance - Quiz',url: '/check-attendance/quiz',icon: 'fa-question-circle' },
        { title: 'Schedule', url: '/schedule', icon: 'fa-calendar' },
        { title: 'Absence Requests', url: '/absence-requests', icon: 'fa-envelope' },
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];

    public teacherMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        { title: 'Check Attendance',url: '/check-attendance',icon: 'fa-check-square-o' },
        { title: 'Quiz',url: '/quiz',icon: 'fa-question-circle' },
        { title: 'Schedule', url: '/schedule', icon: 'fa-calendar' },
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];
}
