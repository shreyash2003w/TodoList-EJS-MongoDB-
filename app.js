const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');
const dotenv = require('dotenv');
dotenv.config();
// var items =[];
// var workItems=[];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use (express.static("public"));

//Connecting to Database

const uri = process.env.DB_String;
mongoose.connect(uri, {useNewUrlParser:true});

const itemSchema = {
  name:String,
};

const Item = mongoose.model("Item",itemSchema);

const listSchema = {
  name:String,
  items: [itemSchema]
};
const List = mongoose.model("List",listSchema);



const item2 = new Item({
  name:"Hit the + button to add a new item"
});

const item1 = new Item({
  name:"Welcome to your todo list"
});

const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];



app.get("/", function (req, res) {
 
  let day = date.getDate();
Item.find({}).then(  async function(foundItems){
  if(foundItems.length === 0){
     await Item.insertMany(defaultItems).then(function(err){
      if(err){
        console.log(err);
      }
    });

    res.redirect("/");
  }
  else{
    res.render("list", { listTitle: "Today" ,NewListItems:foundItems});
  }
 
 })

  
});

app.get("/:customListName",function(req,res){
const customListName =_.capitalize (req.params.customListName);

List.findOne({name:customListName}).then(async function(foundList){
  if(!foundList){
    //Create a new list
    const list = new List({
      name:customListName,
      items:defaultItems
    });
    await list.save();
    res.redirect("/"+ customListName);
  } else{
    //Show an existing list
    res.render("list",{listTitle:foundList.name, NewListItems : foundList.items});
  }
})

})

app.post("/",function(req,res){
  
   let itemName =  req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
    name:itemName
   });

   if(listName === "Today"){
    item.save();
    res.redirect("/");
   } else{
    List.findOne({name:listName}).then(async function(foundList){
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/"+ listName);
    });
   }
   
})

app.get("/work",function(req,res){
  res.render("list",{listTitle:"work List", NewListItems : workItems});
});
app.get("/about",function(req,res) {
  res.render("about");
})

app.post("/delete",function(req,res){
const checkeditemId = req.body.checkbox;
const listName = req.body.listName;
if(listName ===  "Today"){
  Item.findByIdAndRemove(checkeditemId).then(function(err){
    res.redirect("/");
  })
} else{
  List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkeditemId}}}).then(function(foundList){
    res.redirect("/"+listName);
  });
}


});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
