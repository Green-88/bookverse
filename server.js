const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./backend/config/db');
const app = require('./backend/app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`BookVerse running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
