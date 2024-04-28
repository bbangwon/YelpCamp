import mongoose from 'mongoose';
import Campground from '../models/campground.js';
import cities from './cities.js';
import seedHelper from './seedHelpers.js';

//Mongoose MongoDB 연결
mongoose.connect('mongodb://localhost:27017/farmStand')
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
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(seedHelper.descriptors)} ${sample(seedHelper.places)}`,
        });
        await camp.save();
    }
};

seedDB()
.then(() => {
    mongoose.connection.close();
});
