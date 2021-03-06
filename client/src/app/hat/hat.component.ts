import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { } from 'googlemaps'
import * as socketIO from 'socket.io-client'
import { ApiService } from '../api.service'

@Component({
  selector: 'app-hat',
  templateUrl: './hat.component.html',
  styleUrls: ['./hat.component.css']
})

// //DO NOT TOUCH THIS CLASS ROMAN
// export interface Tile {
//   color: string;
//   cols: number;
//   rows: number;
//
// }
// ///////////////////////////////
//



export class HatComponent implements OnInit{
  // this is just used for .PlacesService argument
  @ViewChild('input') dom: ElementRef

  // variables used for socket.io
  user = null
  room = null
  socket = null
  lobby = new Map()
  hat = new Array()

  // Google Maps API variables
  location = null
  GoogleMaps = null
  suggestions = []

  // dom binding
  search_term = null
  html_snippet = null
  constructor(private api:ApiService, private route: ActivatedRoute, private router: Router){}

  private joinRoom(room){ // helper function
    this.socket.emit('room', room, this.user)
  }

  ngOnInit(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        this.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      })
    }

    this.GoogleMaps = new google.maps.places.PlacesService(this.dom.nativeElement)

    this.user = this.api.getUserData()
    console.log('hat: ', this.user)
    //this.room = this.user.username // might obfrustcate room name a bit

    this.socket = socketIO('http://localhost:3000')
    this.route.queryParams.subscribe(params=>{ // this is how invitations are going to be handled
      if(!params.room){ // if no room param in url (room dne) creat room
        console.log('params: ', params)
        this.joinRoom(this.room)
      } else{
        this.room = params.room
        this.joinRoom(this.room) // joins room in the given query param
      }
    })
    // socket.io event handlers
    // gets the randomly-generated room name fromt he server
    this.socket.on('room-name', (room_name)=>{
     this.room = room_name
     console.log('room-name: ', room_name)
   })

    this.socket.on('update-lobby', (data, index)=>{ // get triggered when any users enter
      this.lobby.set(index, data) // adds the user in the lobby<Map>
      console.log("new user: ", this.lobby)
    })

    this.socket.on('update-hat', (choice)=>{ // gets choice from any given user
      console.log(choice)
      this.hat.push(choice)
    })

    this.socket.on('create-lobby', (new_lobby)=>{ // only gets triggered once when the this.user enters
      this.lobby = new Map(new_lobby) // have to reconvert to Map()
      console.log('new lobby: ', this.lobby)
    })

    // this is used to remove choices from users that have disconnected from the hat
    this.socket.on('remove-disconnected',(removed_user)=>{
      console.log('removed: ', removed_user)
      this.hat = this.hat.filter(data => data.user != removed_user)
    })
  }

  // adds restaurant obj to hat
  private addToHat(restaurant){
    // create dialog and ask if they want to add to Hat
    console.log('restaurant to add: ', restaurant)
    console.log('open: ', restaurant.hours.open_now, ' hours: ', restaurant.hours.weekday_text)
    this.socket.emit('add-to-hat', restaurant, this.user, this.room)
    restaurant['user'] = this.user.name
    this.hat.push(restaurant)
    // add it to ui
  }

  private searchGoogle(){
    if(this.search_term == ''){
      this.suggestions = null
    } else{
      console.log(this.search_term)
      // sets options for maps search
      var options = { /* check if you can extend raduis without hardcoding*/
      location: this.location, // uses the location object we created
      name: this.search_term,
      type: ['restaurant'], // duh
      rankBy: google.maps.places.RankBy.DISTANCE
    }
    var results
    this.GoogleMaps.nearbySearch(options, (restaurants, status)=>{
      if(status == google.maps.places.PlacesServiceStatus.OK){
        // do stuff
        console.log(restaurants) // for debugging purposes
        var list = Array()
        restaurants.forEach((data, index)=>{ // make restaurant filtering better
          if(data.name.toLowerCase().indexOf(this.search_term) != -1){ // test more, but might use to filter better
            if(list.length < 10){
              list.push({
                name: data.name,
                address: data.vicinity,
                rating: data.rating,
                hours: data.opening_hours
              })
            } else{
              return
            }
          }
        })
        this.suggestions = list
        console.log('suggestions: ', this.suggestions)
      }
    })
    }
  }

  private select(restaurant){
    console.log('selected: ', restaurant)
  }

  // *ngFor cant iterate through maps so must convert to array
  private lobbyVals(): Array<String>{
    return Array.from(this.lobby.values())
  }

  private disconnect(){
    console.log(this.hat)
    this.socket.emit('disconnect-client', this.room)
    window.location.href='/' // this might be changed in the future
  }


  //THIS IS FOR THE GRID VIEW
  //DO NOT EDIT BELOW THIS COMMENT IF YOUR NAME STARTS WITH AN 'R'





}
