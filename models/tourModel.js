const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!!'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal then 40 characters'],
      minlength: [10, 'A tour must have at least 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour should have duration!!!']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a Group Size']
    },
    difficulty: {
      type: String,
      required: [true, 'A group should have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy,medium,difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be less or equal 5.0'],
      min: [1, 'Rating must be equal or  above 1.0'],
      set: val => Math.round(val * 10) / 10 //4.6666 -> 46.666 -> 47 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!!']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // THIS ONLY POINTS TO CURRENT DOCUM. WHEN YOU CREATE A NEW OBJECT!!!!!!!
          return val < this.price;
        },
        message: ' Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true, //remove all the white space ex: "    I did a lot of white sapces          "
      required: [true, 'A tour must have  a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date], //курсы могут начинаться не только в определенную дату
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1 - means we sort price field in ascending order, -1 in dascending
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function() {
  //this property NOT PART OF DB
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
//DOCUMENT MIDDLEWARE : runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises); // we need to use Promise.all, cuz the result of line 127 is a array of promises, which we will then run
//   next();
// })
// tourSchema.post('save', function(doc,next) {
//   console.log(doc)
//   next();
// });

//Query MiddleWare
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  // /^find/ - все что начинается со слова find
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find().populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});
tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} ml/sec`);
  // console.log(docs);
  next();
});
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
