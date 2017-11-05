import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { AppConfig } from '../config';

@Injectable()
export class QuizService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appService: AppService,public  appConfig:AppConfig, public  authService: AuthService,public  router:Router) {}

    public getQuizByCourseAndClassUrl = this.appConfig.apiHost + '/quiz/list';
    public getQuizByCourseAndClass(course_id: number,class_id: number): Observable < { result: string, quiz_list: Array<any>, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getQuizByCourseAndClassUrl,params,options)
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
    public getQuizDetailUrl = this.appConfig.apiHost + '/quiz/detail';
    public getQuizDetail(quiz_id: number): Observable < { result: string, quiz: any, message:string} > {
        var params = {
            'quiz_id': quiz_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getQuizDetailUrl,params,options)
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
    public getOpeningQuizByCourseAndClassUrl = this.appConfig.apiHost + '/quiz/opening';
    public getOpeningQuizByCourseAndClass(course_id: number,class_id: number): Observable < { result: string, quiz: any, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getOpeningQuizByCourseAndClassUrl,params,options)
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
    public startQuizUrl = this.appConfig.apiHost + '/quiz/start';
    public startQuiz(course_id: number,class_id: number,quiz: any): Observable < { result: string,quiz_id:number, code:string , message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
            'quiz': quiz
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.startQuizUrl,params,options)
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
    public stopQuizUrl = this.appConfig.apiHost + '/quiz/stop';
    public stopQuiz(quiz_id: number): Observable < { result: string, message:string} > {
        var params = {
            'quiz_id': quiz_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.stopQuizUrl,params,options)
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
    public checkQuizCodeUrl = this.appConfig.apiHost + '/quiz/check-code';
    public checkQuizCode(code: string): Observable < { result: string, quiz_id:number, message:string} > {
        var params = {
            'code': code
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.checkQuizCodeUrl,params,options)
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
    public submitQuizUrl = this.appConfig.apiHost + '/quiz/submit';
    public submitQuiz(student_id: number,quiz: any): Observable < { result: string, message:string} > {
        var params = {
            'student_id' : student_id,
            'quiz': quiz
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.submitQuizUrl,params,options)
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
    public deleteQuizUrl = this.appConfig.apiHost + '/quiz/delete';
    public deleteQuiz(quiz_id: number): Observable < { result: string, message:string} > {
        var params = {
            'quiz_id': quiz_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.deleteQuizUrl,params,options)
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
    public addQuizUrl = this.appConfig.apiHost + '/quiz/add';
    public addQuiz(course_id: number,class_id: number,quiz: any): Observable < { result: string, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
            'quiz': quiz
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addQuizUrl,params,options)
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