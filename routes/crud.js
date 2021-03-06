const router = require('express').Router()
const request = require('request')
const db = require('../firebase')
const firebase = require('../local-firebase-api')
const notification_hander = require('../notifications')

router.get('/profile', (req, res)=>{
  console.log('user session data requested') // for debugging
  res.send(req.user.data()) // sends the data from the cookie session
})

router.get('/check-username', (req, res)=>{
  firebase.isUsernameAvailable(req.query.username)
  .then((avaiable)=>{
    res.send({avaiable: avaiable})
  }, (err)=>{
    console.log(err)
  })
})

router.get('/get-history', (req, res)=>{
  firebase.getHistory(req.user.data().username)
  .then((history)=>{
    res.send(history)
  }, (err)=>{
    console.log(err)
  })
})

router.get('/get-friends-list', (req, res)=>{
  firebase.getFriendsDetails(req.user.data().id, req.query.id)
  .then((friends_details)=>{
    res.send(friends_details)
  }, (err)=>{
    console.log(err)
  })

})

router.post('/create-username', (req, res)=>{ // maybe change name of route
  firebase.modifyUsername(req.user.data().id, req.body.username)
  .then((modified)=>{
    res.send({success: modified})
  }, (err)=>{
    console.log(err)
  })
})

router.post('/send-notification', (req, res)=>{
  notification_hander.sendNotification(req.user.data().id, req.body.receiver, req.body.options)
  .then(resp => res.send(resp))
  .catch(err => res.send(err))
})


router.get('/search', (req, res)=>{
  // if req.user to make sure user search only comes from signed-in users
  firebase.searchUser(req.body.search_term)
  .then(user_info => res.send(user_info))
})

// needs a bit more testing
router.post('/send-request', (req, res)=>{
  firebase.sendFriendRequest(req.user.data().id, req.body.requested)
  notification_hander.sendNotification(sender, requested, {notif_type: 'friend-request'})
})

router.post('/accept-request', (req, res)=>{
  // firebase local api that makes db changes
  firebase.acceptFriendRequest(req.user.data().id, req.body.user_accepted)
  notifications.sendNotification(user_accepted, user, {notif_type: 'request-accepted'})
})

router.post('/reject-request', (req, res)=>{
  // firebase local api that makes db changes
  firebase.rejectFriendRequest(req.user.data().id, req.body.user_rejected)
})

module.exports = router
