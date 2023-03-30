const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const fs = require('fs');
const Tour = require('../models/tourModel.js');
const User = require('../models/userModel.js');
const Review = require('../models/reviewModel.js');
mongoose.set('strictQuery', false);

// console.log(process.env)
console.log(process.env.DATABASE);
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  // console.log(con.connections);
  console.log('Db is Connected');
});

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const revoews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(revoews);
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();
      console.log('Data successfully deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
