import { Component } from '@angular/core';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public title = 'Musify';
  public user: User;
  public identity = false;
  public token;

  constructor(){
    this.user = new User('','','','','','ROLE_USER','');
  }

  onSubmit(){
    console.log(this.user)
  }

}
