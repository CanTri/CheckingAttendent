import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService} from './auth.service';
import { AppService } from './app.service';
import { LocalStorageService } from 'angular-2-local-storage';
@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild, CanLoad {
    public constructor(public  appService: AppService, public  authService: AuthService, public  router: Router,public  localStorage : LocalStorageService) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;

        return this.checkLogin(url);
    }
    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }
    public canLoad(route: Route): boolean {
        let url = `/${route.path}`;

        return this.checkLogin(url);
    }

    public checkRole(url:string): boolean{
        if(this.authService.current_user.role_id == this.appService.userType.teacher){
            switch (url) {
                case "/courses":
                    this.router.navigate(['/dashboard']);
                    return false;
                case "/absence-requests":
                    this.router.navigate(['/dashboard']);
                    return false;
                default:
                    return true;
            }
        }
        return true;
    }
    public checkLogin(url: string): boolean {
        if (this.localStorage.get('isLoggedIn')) {
            this.authService.current_user = this.localStorage.get('current_user');
            this.authService.token = this.localStorage.get('token').toString();
            return this.checkRole(url);
        }

        // Store the attempted URL for redirecting
        this.authService.redirectUrl = url;
        this.authService.redirectMessage = 'You have to login first!';
        // Navigate to the login page with extras
        this.router.navigate(['/login']);
        return false;
    }
}
