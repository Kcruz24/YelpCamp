const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground.js");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console.error, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 5; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251/1600x900",
            description:
                "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consectetur eos magni at sit accusantium velit similique aperiam cupiditate cumque, fuga repellat eveniet voluptatum minus impedit dolores aliquid nam obcaecati distinctio!",
            price
        });

        await camp.save();
    }
};

// const deleteAll = async () => {
//     await Campground.remove({title: {$ne: "Roadtrip"}});
//    // res.deletedCount();
// };

// deleteAll();

// seedDB().then(() => {
//     mongoose.connection.close();
// });
