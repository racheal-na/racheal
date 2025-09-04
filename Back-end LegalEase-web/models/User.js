const bcrypt= require('bcryptjs');
const mongoose  = require('mongoose');

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true
    },
    phone:{
        type:Number,
        unique:true
    },
    email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  match: [
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    'please enter a valid email'
  ]
},

    password:{
        type:String,
        required:[true,'please provide an a password'],
        minlength:8,
        unique:true,
    },
    role: { 
    type: String, 
    enum: ['lawyer', 'client','admin'], 
    required: true 
  },
    cases:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case'
    }],
    appointments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointment'
    }],
    avatar: String,
  isActive: { 
    type: Boolean, 
    default: true 
  },
    createAt:{
        type: Date,
        default:Date.now
    }
});


userSchema.index({ role: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


module.exports=mongoose.model('User',userSchema);