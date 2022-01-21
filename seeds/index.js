if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./../.env" });
}
const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const axios = require("axios").default;
const seedsCount = 30; // maximum is 30 for unsplash requesting

mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};
async function getImgUrl() {
  // get url from unsplsh camp collections
  const config = {
    params: {
      client_id: process.env.UNSPLASH_CLIENT_ID,
      collections: process.env.UNSPLASH_COLLECTIONS,
      count: seedsCount,
    },
  };
  const res = axios
    .get("https://api.unsplash.com/photos/random", config)
    .then((res) => {
      //console.log(res.data);
      console.log("-------------------------------------------------------");
      console.log("fetch data from unplash completed ");
      seedDB(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
}
getImgUrl();

const seedDB = async (imgData) => {
  console.log(imgData);
  await Campground.deleteMany({});
  for (let i = 0; i < seedsCount; i++) {
    console.log(i);
    console.log(Math.floor(Math.random() * seedsCount));
    const random1000 = sample(cities);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "61dd7fd6f7a144170077bc09",
      title: `${sample(descriptors)}, ${sample(places)}`,
      location: `${random1000.city}, ${random1000.state}`,
      geometry: {
        type: "Point",
        coordinates: [random1000.longitude, random1000.latitude],
      }, //[121.6, 25.2] },
      //image: `${imgData[i].urls.regular}`,
      images: [
        { url: imgData[i].urls.regular, filename: Math.random().toString() },
        {
          //url: imgData[Math.floor(Math.random() * seedsCount)].urls.regular,
          url: imgData[0].urls.regular,
          filename: Math.random().toString(),
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Necessitatibus, maxime. Animi, assumenda? Illum, commodi aspernatur! Dolores, voluptate. Quo expedita ipsam ad tempore porro eaque in qui, dolor ullam. Eum, neque?",
      price: price,
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
