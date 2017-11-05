import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { AppConfig } from '../config';

@Injectable()
export class FeedbackService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appService: AppService,public  appConfig:AppConfig, public  authService: AuthService,public  router:Router) {}

    public  getFeedbacksUrl = this.appConfig.apiHost + '/feedback/list';
    public getFeedbacks(search_text:string, role_id: number, page: number = 1, limit: number = -1): Observable < { result: string,total_items: number, feedbacks: Array<any>, message:string} > {
        var params = {
            'search_text': search_text,
            'role_id' : role_id,
            'page': page,
            'limit': limit,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getFeedbacksUrl,params,options)
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
    public  readFeedbacksUrl = this.appConfig.apiHost + '/feedback/read';
    public readFeedbacks(feedback_id: number): Observable < { result: string, message:string} > {
        var params = {
            'feedback_id' : feedback_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.readFeedbacksUrl,params,options)
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
    public  sendFeedbacksUrl = this.appConfig.apiHost + '/feedback/send';
    public sendFeedbacks(title: string, content:string, isAnonymous: boolean): Observable < { result: string, message:string} > {
        var params = {
            'title' : title,
            'content' :content,
            'isAnonymous': isAnonymous
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.sendFeedbacksUrl,params,options)
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