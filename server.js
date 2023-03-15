const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const { default: mongoose } = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app.js');
mongoose.set('strictQuery', false);

// console.log(app.get('env'));

const port = process.env.PORT;

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
// const DB = process.env.DATABASE_LOCAL;
// console.log(DB);

console.log(process.env.NODE_ENV)

mongoose.connect(DB).then(() => {
  // console.log(con.connections);
  console.log('Db is Connected');
});

const server = app.listen(port, () => {
  console.log(`App is listening at port ${port}...`);
});


process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(()=> {
    process.exit(1);
  });
})

process.on('uncaughtException', err => {
  console.log(err.name);
  server.close(()=> {
    process.exit(1);
  });
})