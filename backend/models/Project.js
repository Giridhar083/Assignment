const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  }
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    members: [memberSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Helper: get member ID whether populated or not
const getMemberId = (user) => {
  if (user && user._id) return user._id.toString();
  return user.toString();
};

// Helper: check if user is admin of project
projectSchema.methods.isAdmin = function (userId) {
  const member = this.members.find(
    (m) => getMemberId(m.user) === userId.toString()
  );
  return member && member.role === 'admin';
};

// Helper: check if user is a member
projectSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => getMemberId(m.user) === userId.toString()
  );
};

module.exports = mongoose.model('Project', projectSchema);