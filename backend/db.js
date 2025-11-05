const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://pharmastakx_db_user:pharmastackx007@cluster0.tpkohgb.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error('MongoDB connection error:', err));

module.exports = mongoose;
