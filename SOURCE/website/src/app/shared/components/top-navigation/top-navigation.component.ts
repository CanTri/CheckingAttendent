import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
})
export class TopNavigationComponent implements OnInit {

  public constructor(public  router:Router,public  authService : AuthService) { }

  public ngOnInit() {
  }
  public logout(){
  	this.authService.logout();
  	this.router.navigate(['/login']);
  }
}
