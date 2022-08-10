//project completed

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");

// var day = new Date();
// var options = {
//   weekday: "long",
//   day: "numeric",
//   month: "long"
// };
// var today = day.toLocaleDateString("en-US", options);

// var items = [];
// var workItems = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
// mongoose.connect("mongodb+srv://maneshwarS:mpfranklin@cluster0.yk6jwtu.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true});

mongoose.connect("mongodb+srv://maneshwarS:mpfranklin@cluster0.yk6jwtu.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To-Do list"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   } else{
//     console.log("Successfully saved default items to DB!");
//   }
// });

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Successfully saved default items to DB!");
        }
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // console.log("Doesn't Exist!");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else{
        // console.log("Exists!");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){
  // var item = req.body.newItem;
  // items.push(item);
  // res.redirect("/");
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Checked item successfully deleted!");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});



app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.post("/work", function(req, res){
  var item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
//
// app.listen(port, function(){
//   console.log("Server has started sucessfully!");
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
