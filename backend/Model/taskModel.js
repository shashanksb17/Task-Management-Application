const mongoose = require('mongoose');


const TaskSchema = mongoose.Schema({

    userId : {type : String},
    title : {type : String},
    description : {type:String},
    in_progress : {type : Boolean, default : false},
    is_completed : {type : Boolean, default : false},
    createdAt: { type: Date, default: Date.now },
    
}, {versionKey:false})

const TaskModel = mongoose.model("task", TaskSchema)

module.exports = TaskModel