const mongoose= require("mongoose");
const connectRequestSchema= new mongoose.Schema({
    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true 
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:"User",
        required:true
    },
    status:{
        type: String,
        required:true,
        enum:
        {
            values:["ignored", "interested", "accepted","rejected"],
            message:`{VALUE} is incorrect status type`,
        }
    },
}, 
    {timestamps:true }
);

connectRequestSchema.index({fromUserId:1, toUserId:1});

connectRequestSchema.pre("save", function(next){
    const connectionRequest=this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId))
    {
        throw new Error("cannot send connection request to yourself");
    }
    next();
});
const ConnectRequestModel=new  mongoose.model(
    "ConnectionRequest",
    connectRequestSchema
);
module.exports=ConnectRequestModel; 