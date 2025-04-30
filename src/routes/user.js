const express=require("express");
const { UserAuth } = require("../middleware/auth");
const userRouter=express.Router();
const ConnectionRequest=require("../Models/connectRequest");
const user = require("../Models/user");

const USER_SAFE_DATA="firstName lastName gender age about photoUrl";

userRouter.get("/user/request/recieved", UserAuth, async (req, res)=>{
    try{
        const loggedInuser=req.user;

        const connectionRequests= await ConnectionRequest.find({
            toUserId:loggedInuser._id,
            status:"interested",
        }).populate(
            "fromUserId",
             "firstName lastName age gender about photoUrl"
        );

         res.json({
            message: "data is fetched successfully",    
            data:connectionRequests,
         })
    }catch(err){
        res.status(400).send("ERROR"+err.message);
    }
});

userRouter.get("/user/connections", UserAuth, async(req, res)=>{
    try{
        const loggedInuser=req.user;

        const connectionRequests= await ConnectionRequest.find({
            $or:[
                {toUserId: loggedInuser._id , status:"accepted"},
                {fromUserId: loggedInuser._id , status:"accepted"}
            ],
        }).populate("fromUserId",USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        const data=connectionRequests.map((row)=>{
            if(row.fromUserId._id.toString()===loggedInuser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({data});
          
    }catch(err)
    {
        res.status(400).send("ERROR"+ err.message);
    }
});

userRouter.get("/feed", UserAuth, async(req, res)=>{
    try{
        const loggedInuser=req.user;

        const page=parseInt(req.query.page)||1;
        let limit=parseInt(req.query.limit)||10;
        limit=limit>50?50:limit;
        const skip=(page-1)*limit;


        const connectionRequests =await ConnectionRequest.find({
            $or:[
                {fromUserId:loggedInuser._id},{toUserId:loggedInuser._id}
            ]
        }).select("fromUserId toUserId");

        const HideUserFromFeed=new Set();
        connectionRequests.forEach((req)=>{
        HideUserFromFeed.add(req.fromUserId.toString());
        HideUserFromFeed.add(req.toUserId.toString());

        });
        //console.log(HideUserFromFeed);
        
        const users=await user.find({
            $and:[
                {_id:{$nin: Array.from(HideUserFromFeed)}},
                {_id:{$ne:loggedInuser._id}},
            ],
        }).select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit);

        res.send(users);
    }catch(err)
    {
        res.status(400).json({message: err.message});
    }
});

module.exports=userRouter; 