import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class ApiService{
  constructor(private http: HttpClient){}
  // creates an observable to avoid having to call to api multiple times for user-nfo
  private user = null
  // used for components
  public changeUserData(data){ this.user = data }
  public getUserData(){ return this.user }

  // create user for application or log them in. Backend API handles which to do
  getProfile(){ return this.http.get('api/crud/profile') }
  // checks if username is available based on user input
  checkUsername(username){ return this.http.get('api/crud/check-username', {params: {username: username}}) }
  // the post request that adds the given username to the db
  createUsername(username){ return this.http.post('api/crud/create-username', {username: username}) }
  // gets hat history from db
  getHistory(){ return this.http.get('api/crud/get-history') }
  // gets the friend list from the db
  getFriendsList(){ return this.http.get('api/crud/get-friends-list') }
  // sends friend request to user
  sendFriendRequest(to){ return this.http.post('api/crud/send-request', {requested: to}) }
  // accepts friend request from a user
  acceptFriendRequest(accepted){ return this.http.post('api/crud/accept-request', {user_accepted: accepted}) }
  // sends hat invitation to user
  sendHatInvitation(user, room_name){
    var options = {
      notif_type: 'hat-invitation',
      room_name: room_name
    }
    return this.http.post('api/crud/send-notification', {receiver: user, options: options})
  }
  // gets signin status for route guard
  getSignInStatus(): Observable<boolean>{ return this.http.get<boolean>('api/google/signin-status') }
}
