import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class StudentService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http, public  appConfig: AppConfig, public  authService: AuthService,public  router:Router) {}
        // private instance variable to hold base url
    public  getListStudentsUrl = this.appConfig.apiHost + '/student/list';
    public getListStudents(program_id: number, class_id: number,status : number,searchText: string, page: number = 1, limit: number = 10): Observable < { result: string, total_items: number, student_list: Array<any>, message:string } > {
        var params = {
            'searchText': searchText,
            'page': page,
            'limit': limit,
            'program_id': program_id,
            'class_id': class_id,
            'status': status
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getListStudentsUrl, params,options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public  getStudentDetailsUrl = this.appConfig.apiHost + '/student/detail';
    public getStudentrDetail(id: number): Observable < { result: string, student: any, current_courses: Array<any>, message:string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${this.getStudentDetailsUrl}/${id}`,options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public  addStudentUrl = this.appConfig.apiHost + '/student/add';
    public addStudent(program_id: number, class_id:number, code: string , first_name: string, last_name: string, email: string, phone: string = null, note:string = null): Observable < { result: string, message: string } > {
        var params = {
            'program_id': program_id,
            'class_id': class_id,
            'code': code,
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone,
            'note': note
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addStudentUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }
    public  updateStudentUrl = this.appConfig.apiHost + '/student/update';
    public updateStudent(id:number , name: string, email: string, phone: string, status:number): Observable < { result: string, message: string } > {
        var params = {
            'id': id,
            'name': name,
            'email': email,
            'phone': phone,
            'status': status
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.updateStudentUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public importStudentUrl = this.appConfig.apiHost + '/student/import';
    public importStudent(class_name:string , student_list:Array<any>): Observable < { result: string, message: string } > {
        var params = {
            'class_name': class_name,
            'student_list': student_list
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.importStudentUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public exportStudentUrl = this.appConfig.apiHost + '/student/export';
    public exportStudent(classes_id:Array<any>): Observable < { result: string,student_lists:Array<any>, message: string } > {
        var params = {
            'classes_id': classes_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.exportStudentUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public getStudentDetailByCodeUrl = this.appConfig.apiHost + '/student/detail-by-code';
    public getStudentDetailByCode(code: string): Observable < { result: string, student: any, message:string} > {
        var params = {
            'code': code,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getStudentDetailByCodeUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }
    public changeAttendanceStatusUrl = this.appConfig.apiHost + '/student/change-attendance-status';
    public changeAttendanceStatus(student_id: number,course_id: number,class_id: number,status: number): Observable < { result: string, message:string} > {
        var params = {
            'student_id': student_id,
            'course_id': course_id,
            'class_id': class_id,
            'status': status
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.changeAttendanceStatusUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }

    public exportExamineesUrl = this.appConfig.apiHost + '/student/export-examinees';
    public exportExaminees(class_has_course_id:Array<any>): Observable < { result: string,examinees_lists:Array<any>, message: string } > {
        var params = {
            'class_has_course_id': class_has_course_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.exportExamineesUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                return Observable.throw(error || 'Server error');
            });
    }
}
