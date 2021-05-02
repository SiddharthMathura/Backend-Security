require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);


app.get("/", (req,res)=>{
    res.render("index");
});

app.get("/secret",auth, (req,res)=>{
  //console.log(`${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/logout",auth, async (req,res)=> {
    try {

        //single logout
        //req.user.tokens = req.user.tokens.filter((object)=>{
        //    return object.token !== req.token;
        //});

        //logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("Logout Successfully");

        await req.user.save();

        res.render("login");
    } catch (error) {
        res.status(500).send();
    }
});

app.get("/login", (req,res)=> {
    res.render("login");
});

app.post("/login", async(req,res)=> {
    try{
        const email = req.body.email;
        const password = req.body.password;

        const logindata = await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(password, logindata.password);

        const token = await logindata.generateAuthToken();

        res.cookie("jwt", token,{
        expires: new Date(Date.now()+600000),
        httpOnly:true,
      //secure:true  
        });

        if(isMatch){
            res.status(201).render("index");  
        }else{
            res.status(400).send("Invalid Email or Password.");
        }
    }catch(err){
        res.status(400).send("Invalid Email or Password.");
    }
})

app.get("/register", (req,res)=>{
    res.render("register");
});

//creating new user in our db
app.post("/register", async(req,res)=>{
    try{
        
        const password = req.body.password;
        const cpassword = req.body.cpassword;
       if(password === cpassword){

            const registerEmp = new Register({
                firstname: req.body.fname,
                lastname: req.body.lname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.num,
                password: req.body.password,
                confirmpassword: req.body.cpassword
            })

            const token = await registerEmp.generateAuthToken();

            res.cookie("jwt", token, {
                expires: new Date(Date.now()+50000),
                httpOnly:true
            });

            const regdata = await registerEmp.save();
            res.status(201).render("index");

        }else{
            res.send("Password doesn't match.")
        }
       
    }catch(err){
        res.status(400).send(err);
    }
});


app.listen(port, ()=>{
    console.log(`Connection running at ${port} successfully.`);
});