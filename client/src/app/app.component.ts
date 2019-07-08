import { Component, OnInit } from '@angular/core';
import {UserService} from './services/user.service';
import { User } from './models/user';
import { identity } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
})
export class AppComponent implements OnInit {
  public title = 'Musify';
  public user: User;
  public identity;
  public token;
  public errorMessage;

  constructor(private _userService:UserService){
    this.user = new User('','','','','','ROLE_USER','');    
  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    console.log('in ngOnInit');
    console.log(this.identity);
    console.log(this.token);
  }


  onSubmit(){
    console.log(this.user);

    // Conseguir los datos del user identificado
    this._userService.singup(this.user).subscribe(
      response =>{
        console.log(response);
        let identity = response.user;
        this.identity = identity;

        if(!this.identity._id){
          alert("El usuario no esta correctamente identificado");          
        }else{
          // Crear elemento en el local starage para tener al usuario en sesion
          localStorage.setItem('identity',JSON.stringify(identity));

          // Conseguir el token para enviarlo a cada peticion
          this._userService.singup(this.user,'true').subscribe(
            response =>{
              console.log(response);
              let token = response.token;
              this.token = token;
      
              if(this.token.length <= 0){
                alert("El token es incorrecto");          
              }else{
                // Crear elemento en el local starage para tener el token disponible
                localStorage.setItem('token',token);
                console.log(token);
                console.log(identity);
                
              }
      
            },
            error => {
              var errorMessage = <any>error;
              if(errorMessage != null){
                var body = JSON.parse(error._body);
                this.errorMessage = body.message;
                console.log(error);
              }
            }
          );
        }

      },
      error => {
        var errorMessage = <any>error;
        if(errorMessage != null){
          var body = JSON.parse(error._body);
          this.errorMessage = body.message;
          console.log(error);
        }
      }
    );
  }

  
  logout(){
    //puedo usar este metodo y remover todo
    localStorage.clear();
    //o remover item por item usando la clave
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    this.identity = null;
    this.token = null;
  }

}
