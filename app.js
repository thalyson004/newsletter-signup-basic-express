
const express = require("express");
const parser = require("body-parser");
const https = require("https");
const mailchimp = require('@mailchimp/mailchimp_marketing');
const secrect = require(__dirname+"/secrect.js");

const port = (process.env.PORT || 3000)
var app = express();

app.use(express.static("public"));
app.use( parser.urlencoded({extended:true}) );

app.listen(port, ()=>{
  console.log("I'm working at port "+ port+".");
});

app.get("/", (req,res)=>{
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", async (req,res)=>{
  const data = {
    members: [
      {
        email_address:req.body.email,
        status: "subscribed",
        merge_fields:{
          FNAME: req.body.firstName,
          LNAME: req.body.lastName
        }
      }
    ]
  }
  const dataStringfy = JSON.stringify(data);

  mailchimp.setConfig({
     apiKey: secrect.apiKey,
     server: secrect.server,
   });

   const run = async () => {
     const response = await mailchimp.lists.batchListMembers(secrect.audienceId, dataStringfy);
     if( response.errors.length==0 ){
       res.sendFile(__dirname+"/success.html");
     }else{
       res.sendFile(__dirname+"/failure.html");
       console.log("Failure adding. " + response.errors[0].error_code);
     }
     return;
   };
   await run();
});

app.post("/failure", (req, res)=>{
  res.redirect("/");
});
