import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppConfig } from '../config'
import { AuthService } from './auth.service'
declare var PNotify: any;
declare var jQuery: any;
@Injectable()
export class AppService {

    constructor(public http: Http, public appConfig: AppConfig, public authService: AuthService, public router: Router) {}
    public student_status = {
        active: {
            id: 0,
            title: 'Active'
        },
        reserved: {
            id: 1,
            title: 'Reserved'
        },
        dropped: {
            id: 2,
            title: 'Dropped'
        }
    };
    public absence_request_status = {
        new: {
            id: 0,
            title: 'New'
        },
        accepted: {
            id: 1,
            title: 'Accepted'
        },
        rejected: {
            id: 2,
            title: 'Rejected'
        },
    }
    public import_export_type = { student: 0, teacher: 1, course: 2, schedule: 3, examinees: 4 };
    public enrollment_status = { compulsory: 0, elective: 1 };
    public attendance_status = { normal: 0, exemption: 1 };
    public userType = { admin: 0, student: 1, teacher: 2, staff: 3 };
    public attendance_type = { absent: 0, checklist: 1, qr: 2, quiz: 3, face: 4 };
    
    public getSemesterProgramClassUrl = this.appConfig.apiHost + '/semesters-programs-classes';
    public getSemesterProgramClass(): Observable < { result: string, semesters: Array < any > , programs: Array < any > , classes: Array < any > , message: string } > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getSemesterProgramClassUrl, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }
    public addSemesterUrl = this.appConfig.apiHost + '/semester/create';
    public addSemester(name, start_date, end_date, vacation_time): Observable < { result: string, message: string } > {
        var params = {
            'name': name,
            'start_date': start_date,
            'end_date': end_date,
            'vacation_time': vacation_time
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addSemesterUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }
    public addClassUrl = this.appConfig.apiHost + '/class/create';
    public addClass(name, email, program_id, student_list: Array < any > = []): Observable < { result: string, message: string } > {
        var params = {
            'name': name,
            'email': email,
            'program_id': program_id,
            'student_list': student_list
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addClassUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }
    public addProgramUrl = this.appConfig.apiHost + '/program/create';
    public addProgram(name, code): Observable < { result: string, message: string } > {
        var params = {
            'name': name,
            'code': code,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addProgramUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public changePasswordUrl = this.appConfig.apiHost + '/user/change-password';
    public changePassword(current_password, new_password, confirm_password): Observable < { result: string, message: string } > {
        var params = {
            'current_password': current_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.changePasswordUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public showPNotify(title, message, type) {
        PNotify.desktop.permission();
        new PNotify({
            title: title,
            text: message,
            type: type,
            delay: 3000,
            animation: "fade",
            styling: 'fontawesome',
            buttons: { closer: true, sticker: false },
            stack: { "dir1": "down", "dir2": "right", "firstpos1": 25, "firstpos2": (jQuery(window).width() / 2) - (Number(PNotify.prototype.options.width.replace(/\D/g, '')) / 2) },
        });
    }
}
