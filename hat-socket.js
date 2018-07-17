const socket = require('socket.io')

// TODO: update the data struct all thoughout the app
// TODO: move all socket.io code to a different file

module.exports = function(app){
  io = socket(app)


  // socket io variables
  var rooms = new Map()

  // helper functions
  function createUserData(user){
    return user_data = {
      name: user.name,
      username: user.username,
      photo: user.photo
    }
  }

  function duplicateUserHadling(room_name, user){
    var duplicate = false
    rooms.get(room_name).forEach((current_user, key)=>{
      if(user.username == current_user.username){ // user already in lobby
          console.log('you\'re already in here!')
          rooms.get(room_name).delete(key)
          duplicate = true
          return
      }
    })
    return duplicate
  }

  // socket.io server events
  io.on('connection', (socket) =>{
    // only comes out when we have contacted the client too
  	console.log('made socket connection', socket.id);

  	// connect to a room
  	socket.on('room', (room_name, user)=>{
  		if(!rooms.has(room_name)){
  			rooms.set(room_name, new Map())
  		}

  	/* to handle duplicate users we will create the function duplicateUserHadling(room_name, user)
  		 which will be a wrapper for lines 73-80 (rooms.get()...blah blah blah) which will
  		 handle the case of a duplicate user and return a boolean value, respectively.
  		 then the entire process of adding a user to the lobby Map will be within a block of
  		 an if statement which will evaluate the return of duplicateUserHadling()
  	*/
      duplicate = duplicateUserHadling(room_name, user)
      user_data = createUserData(user)
      rooms.get(room_name).set(socket.id, user_data)
      console.log('duplicate: ', duplicate);
      if(duplicate){
        console.log('sent to create-lobby');
        io.sockets.to(room_name).emit('create-lobby', Array.from(rooms.get(room_name))) // re-does the lobby instead of being complicated
      } else{
        io.sockets.in(room_name).emit('update-lobby', user_data, socket.id) // sends user info to client for ui
      }

      socket.join(room_name)
      io.sockets.to(socket.id).emit('create-lobby', Array.from(rooms.get(room_name))) // converts to array bc socket.io cant transcribe maps
  	})

  	socket.on('add-to-hat', (restaurant, user, room_name)=>{
  		restaurant['user'] = user.name
  		socket.to(room_name).emit('update-hat', restaurant)
  	})

    /* sends client updated lobby that has the user removed.
    sends client username to remove restaurants in the hat
       added by the user that was removed.
       disconnects the current socket from socket.io.
    */
  	socket.on('disconnect-client', (room_name)=>{
      removed_user = rooms.get(room_name).get(socket.id)
      rooms.get(room_name).delete(socket.id)

      io.sockets.in(room_name).emit('remove-disconnected', removed_user.name)
  		io.sockets.in(room_name).emit('create-lobby', Array.from(rooms.get(room_name)))
      socket.disconnect(true)
  	})

  	// removes the user from the socket.io connection
  	socket.on('disconnect', ()=>{
  		console.log(socket.id+' has disconnected')
  	})
  })

  return io
}
