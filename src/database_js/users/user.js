var mongoose = require('mongoose');

//schema definition
var userSchema = new mongoose.Schema({
    username: {type : String, required : true, unique : true},
    password: {type : String, required : true},
    inst_presets: {
        type : Map,
        of : Object,
        default : {}
    },
    sequences : {
        type : Map,
        of : Array,
        default : {}
    }
});

//instance method definitions
userSchema.methods.addInstPreset = function(preset){
    this.inst_presets.set(preset.name, preset.inst);
    this.save();
};

userSchema.methods.addSequence = function(seq){
    this.sequences.set(seq.name, seq.table);
    this.save();
};

userSchema.methods.getInstruments = function(){
    return Array.from(this.inst_presets.keys());
}

userSchema.methods.getSequences = function(){
    return Array.from(this.sequences.keys());
}
//static method definitions
userSchema.statics.findByUsername = function(un){
    return this.find({username : un});
};

//model definition
//var User = mongoose.model('user', userSchema);

module.exports = mongoose.model('user', userSchema);
