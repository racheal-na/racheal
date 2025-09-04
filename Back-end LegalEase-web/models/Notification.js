const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    message:{
        type:String,
        required: true
    },
    type:{
        type: String,
        enum:['appointment','document','case','system'],
        required:true
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
     relatedEntity: {
    entityType: {
      type: String,
      enum: ['Case', 'Appointment', 'Constitution', 'User']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
    onModel:{
        type:String,
        enum:['Case','Document','Appointment']
    },
    read:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 });
module.exports = mongoose.model('Notification',notificationSchema)