const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    personal: {
      image: String,
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      introduction: String,
    },

    education: [{ degree: String, institution: String, percentage: String }],
    experience: [{
      organization: String,
      location: String,
      position: String,
      ctc: String,
      joiningDate: String,
      leavingDate: String,
      technologies: String,
      description: String,
    }],
    projects: [{
      title: String,
      teamSize: String,
      duration: String,
      technologies: String,
      description: String,
    }],
    skills: [{ name: String, level: String }],
    socials: [{ platform: String, link: String }],

    layoutOptions: {
      color: String,
      font: String,
      fontSize: Number,
    },

    layoutChoice: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Sharing fields
    shareToken: { type: String, unique: true, sparse: true }, // Unique token for sharing
    isShared: { type: Boolean, default: false },
    sharedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
