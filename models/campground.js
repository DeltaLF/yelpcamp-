const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const ImageSchema = mongoose.Schema({ url: String, filename: String });
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: { type: String, enum: ["Point"], requried: true },
      coordinates: { type: [Number], required: true },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function (e) {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }

  // for (id of doc.reviews) {
  //   const res = await Review.findByIdAndDelete(id);
  //   console.log(res);
  // }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
