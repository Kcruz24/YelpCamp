const mongoose = require("mongoose");
const { cloudinary } = require("../cloudinary");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// DELETE ALL ASSOCCIATED REVIEWS WITH A CAMPGROUND
// This is a middleware
CampgroundSchema.post("findOneAndDelete", async function (camp) {
    if (camp) {
        await Review.deleteMany({
            _id: {
                $in: camp.reviews
            }
        });

        for (let img of camp.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
