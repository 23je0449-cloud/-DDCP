// app.js
import mongoose from 'mongoose';
import User from './models/User.js'
import Worker from './models/Workers.js'
import Task from './models/Task.js'
import Option from './models/Options.js'
import Submittion from './models/Submittion.js'

mongoose.connect('mongodb+srv://ujjwalchhablani98:sYatftiCTxGWnPWh@ddcc.esiid9z.mongodb.net/?retryWrites=true&w=majority&appName=ddcc', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  // You can now create or fetch documents from the collections
}).catch(err => {
  console.error(err);
});
