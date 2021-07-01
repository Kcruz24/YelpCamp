const mongoose = require("mongoose");
const { cloudinary } = require("../cloudinary");
const Review = require("./review");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
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
