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

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            // YOUR USER ID
            author: "60da64da506d1065906dd0c1",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consectetur eos magni at sit accusantium velit similique aperiam cupiditate cumque, fuga repellat eveniet voluptatum minus impedit dolores aliquid nam obcaecati distinctio!",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: "https://res.cloudinary.com/kcruzcloud/image/upload/v1625207955/YelpCamp/sfbfdxsu56fwfs9pi7g0.jpg",
                    filename: "YelpCamp/sfbfdxsu56fwfs9pi7g0"
                },
                {
                    url: "https://res.cloudinary.com/kcruzcloud/image/upload/v1625207957/YelpCamp/cbycx0qvphh3v9hqcq9n.jpg",
                    filename: "YelpCamp/cbycx0qvphh3v9hqcq9n"
                }
            ]
        });

        await camp.save();
    }
};

// const deleteAll = async () => {
//     await Campground.remove({title: {$ne: "Roadtrip"}});
//    // res.deletedCount();
// };

// deleteAll();

seedDB().then(() => {
    mongoose.connection.close();
});
