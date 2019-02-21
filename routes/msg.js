const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

require('../models/User');
const User = mongoose.model('users');

// Idea Index Page
router.get('/', ensureAuthenticated ,(req, res) => {
  // Idea.find({user: req.user.id})
  Idea.find({user: req.user.email})
    .sort({date:'desc'})
    .then(ideas => {
      res.render('msg/index', {
        ideas:ideas,
        id : req.user.email
      });
    });
});

router.get('/none', (req, res) => {
  res.render('msg/none')
})

// Add Idea Form
router.get('/:id', (req, res) => {
  User.findOne({ email : req.params.id}).then(user => {
    // console.log(user)
    if(user){
      // console.log('user is real')
      res.render('msg/add', {
        id : req.params.id,
        name : user.email
      })
    } else {
      // console.log('not real')
      // res.render('ideas/none')
      res.redirect('/msg/none');
    }
  }).catch(function(){
    res.redirect('/msg/none')
  })
});

// Process Form
router.post('/:id', (req, res) => {
  let errors = [];

  // if(!req.body.title){
  //   errors.push({text:'Please add a title'});
  // }
  if(!req.body.details){
    errors.push({text:'Please add the message'});
  }

  if(errors.length > 0){
    User.findOne({ email : req.params.id}).then(user => {
      res.render('msg/add', {
        id : req.params.id,
        name: user.name,
        errors: errors,
        // title: req.body.title,
        details: req.body.details
      });
    })
  } else {
    const newUser = {
      // title: req.body.title,
      details: req.body.details,
      user: req.params.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Message added');
        res.redirect('/msg/' + req.params.id);
      })
  }
});

// Edit Form process
// router.put('/:id', ensureAuthenticated, (req, res) => {
//   Idea.findOne({
//     _id: req.params.id
//   })
//   .then(idea => {
//     // new values
//     idea.title = req.body.title;
//     idea.details = req.body.details;

//     idea.save()
//       .then(idea => {
//         req.flash('success_msg', 'Video idea updated');
//         res.redirect('/ideas');
//       })
//   });
// });
//ensureAuthenticated
// Delete Idea
router.delete('/:id', ensureAuthenticated,  (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Message removed');
      res.redirect('/msg');
    });
});

module.exports = router;