const mongoose=require("mongoose");

const MessageSchema=new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    text:{
        type:String,
        required: true,

    }
},
{timestamps: true})

const ChatSchema= new mongoose.Schema({
    participants:[
        {type: mongoose.Schema.Types.ObjectId, ref:"user", required:true},
    ],
    messages:[MessageSchema],
})

const Chat =mongoose.model("chat", ChatSchema);
module.exports={Chat}