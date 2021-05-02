const mongoose = require("mongoose");

mongoose.connect(process.env.CONN,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
    
}).then( ()=> {
    console.log("Connection Successfull.")
}).catch((err)=> {
    console.log("Connection Failed.");
})