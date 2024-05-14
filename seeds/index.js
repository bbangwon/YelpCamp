import mongoose from 'mongoose';
import Campground from '../models/campground.js';
import cities from './cities.js';
import seedHelper from './seedHelpers.js';

//Mongoose MongoDB 연결
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log('Database connected');
})
.catch(err => {
    console.log('Error');
    console.log(err);
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '663c2bf922312bbb9e91f92b', //admin user id
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(seedHelper.descriptors)} ${sample(seedHelper.places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dibhzzbts/image/upload/v1715419071/YelpCamp/mnqb0doh0qeneoigkiey.jpg',
                  filename: 'YelpCamp/mnqb0doh0qeneoigkiey',
                },
                {
                  url: 'https://res.cloudinary.com/dibhzzbts/image/upload/v1715419073/YelpCamp/squzkvc7j92kli90uidp.jpg',
                  filename: 'YelpCamp/squzkvc7j92kli90uidp',
                }
              ]
        });
        await camp.save();
    }
};

seedDB()
.then(() => {
    mongoose.connection.close();
});
