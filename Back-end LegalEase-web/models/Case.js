const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    caseType:{
        type:String,
        enum:['criminal','civil','family','employment'],
        
    },
    status:{
        type: String,
        enum: ['open','closed','in progress','pending'],
        default: 'open'
    },
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required: true
    },
    lawyerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required: true
    },
    documents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Document'
    }],
    appointment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointment'
    }],
    notes:[{
        content:String,
        createBy:{
             type: mongoose.Schema.Types.ObjectId,
             ref:'user',
        },
        createdAt:{
            type: Date,
            default: Date.now
        }
    }],
    createdAt:{
            type: Date,
            default: Date.now
        },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    upatedAt:{
        type: Date,
        default: Date.now
    },
    notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
});

caseSchema.pre('save',async function (next) {
    this.updatedAt = Date.now();
    next();
});
// Indexes for better query performance
caseSchema.index({ adminId: 1, status: 1 });
caseSchema.index({ clientId: 1 });
caseSchema.index({ category: 1 });


module.exports=mongoose.model('Case',caseSchema);