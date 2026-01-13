const mongoose = require('mongoose');
const slugify = require('slugify');

const PostSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'],
      trim: true,
      minlength: 3,
      maxlength: 200
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },

    content: { 
      type: String, 
      required: [true, 'Content is required'],
      trim: true
    },

    image: { 
      type: String,
      trim: true
    },

    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: [true, 'Author is required']
    },

    isPublished: { 
      type: Boolean, 
      default: false 
    },

    publishedAt: { type: Date },

    tags: [{ 
      type: String, 
      trim: true,
      lowercase: true 
    }]
  },
  { timestamps: true }
);

// Auto-generate slug if missing or title changed
PostSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Keep updatedAt fresh on updates for consistency
PostSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Post', PostSchema);
