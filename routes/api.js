/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;
 
module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      client.connect(err => {
        const collection = client.db("personal-library").collection("books");
        collection.find({}).toArray((err, info) => {
          if (err) return console.log(err);
            return res.json(info);
        client.close();  
        });     
      });  
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(title == null || title == "")
        return res.send('Title is not filled');
      const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      client.connect(err => {
        const collection = client.db("personal-library").collection("books");
        collection.insertOne({
          title: title,
          commentcount: 0
          }, (err, info) => {
            if (err) return (err);
            return res.json(info.ops[0]);
          });
        client.close();
      });  
    })
    
    .delete(function(req, res){
      const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      client.connect(err => {
        const collection = client.db("personal-library").collection("books");
        collection.deleteMany({}, (err) => {
          if (err) return (err);
          return res.json("complete delete successful");
        });
        client.close();
      });  
    });


  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if(bookid == "" || bookid == null)
        return res.json("Id required"); 
      if(!ObjectId.isValid(bookid))
        return res.json("No book exists");
      const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      client.connect(err => {
        const collection = client.db("personal-library").collection("books");
        collection.findOne({_id: ObjectId(bookid)}, (err, info) => {
          if (err) return (err);
          if (!info)
            return res.json("No book exists");
          info = info.hasOwnProperty("comments") ? info : Object.assign(info, {comments: []});
          return res.json(info);
          });
        client.close();
      });  
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(bookid == "" || bookid == null || comment == "" || comment == null)
        return res.json("Id and comment required");
      if(!ObjectId.isValid(bookid))
        return res.json("No book exists");
      const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      client.connect(err => {
        const collection = client.db("personal-library").collection("books");
        collection.findOne({_id: ObjectId(bookid)}, (err, info) => {
          if (err) return (err);
          if (info == null) 
            return res.json("Invalid id");
          else  {
            info = info.hasOwnProperty("comments") ? info : Object.assign(info, {comments: []});
            info.comments.push(comment);
            info.hasOwnProperty("commentcount") ? info.commentcount = (info.commentcount + 1) : info = Object.assign(info, {commentcount: 1});
            collection.updateOne(
              { _id: info._id },
              {$set: {comments: info.comments,
                      commentcount: info.commentcount }
              },(err, updateInfo) => {
              if (err) return (err);
              return res.json(info);
            });  
          }  
        client.close();
        });  
      })
    })
  
    .delete(function(req, res){
      var bookid = req.params.id;
      if(bookid == "" || bookid == null)
        return res.json("Id required");
      if(!ObjectId.isValid(bookid))
        return res.json("No book exists");
      const MongoClient = require('mongodb').MongoClient;
      const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      client.connect(err => {
        const collection = client.db("personal-library").collection("books");
        collection.findOne({_id: ObjectId(bookid)}, (err, info) => {
		      if (err) return (err);
          if (info == null || info._id != bookid) {
            return res.json("could not delete " + bookid);
          }
          else {
            collection.deleteOne({ _id: info._id }, (err, obj) => {
              if (err) return err;
              return res.json("delete succesful");
            });
          }                       
        });
      });
      client.close();    
    });
  
};
