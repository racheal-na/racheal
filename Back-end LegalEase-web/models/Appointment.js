const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    date:{
        type: Date,
        required: [true, 'Please provide an appointment date'] 
    },
    duration:{
        type:Number,
        default:60
    },
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case'
    },
    clinetId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    lawyerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Pending'],
    default: 'Scheduled'
  },
    reminderSent:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    location: {
    type: String,
    default: 'Office'
  },
  meetingLink: {
    type: String
  }
});
appointmentSchema.index({ lawyerId: 1, date: 1 });
appointmentSchema.index({ clientId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });


module.exports = mongoose.model('Appointment',appointmentSchema);