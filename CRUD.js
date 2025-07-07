// Connecting to mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/factory');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Setup readline and ask()
const readline = require('readline');
const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function ask(questionText) {
  return new Promise((resolve) => {
    readlineInterface.question(questionText, resolve);
  });
}

// Define the schema and model
const robotSchema = new mongoose.Schema({
  creatorName: String,
  robotName: String,
  robotColor: String,
  killer: Boolean,
  friend: Boolean,
  serialNumber: Number,
  date: Date
});
const Robot = mongoose.model('robots', robotSchema);

// Start function
async function start() {
  let action = await ask("Welcome to the robot factory! What do you want to do? (Create, Read, Update, Delete)   ");
  action = action.trim().toLowerCase();

  // Validate action input
  if (action === 'create') {
    let creatorName = await ask('Who is the creator? ');
    let robotName = await ask('Designate this robot? ');
    let robotColor = await ask('What color is this robot? ');
    let friendAnswer = await ask('Is this robot a friend? Enter Y or N: ');
    let friend, killer;
   
    // Determine if the robot is a friend or a killer
    if (friendAnswer.trim().toLowerCase().startsWith('y')) {
      friend = true;
      killer = false;
    } else {
      friend = false;
      killer = true;
      console.log('Oh no! A killer robot!');
    }
    // Get the serial number and date
    // Ensure serial number is a number
    let serialNumber = await ask('What is the serial number? ');
    serialNumber = parseInt(serialNumber, 10);
    let date = new Date();

    const response = new Robot({
      creatorName,
      robotName,
      robotColor,
      friend,
      killer,
      serialNumber,
      date
    });

    await response.save();
    console.log('Your robot has been created!');

  } else if (action === 'read') {
    let allRobots = await Robot.find({});
    console.log(allRobots);

  } else if (action === 'update') {
    let allRobots = await Robot.find({});
    console.log(allRobots);

    let updateTarget = await ask('What is the ID of the robot you want to update? ');
    let updateField = await ask('What field do you want to update? ');
    let update = await ask('Enter a new value: ');

    // Cast number fields if needed
    if (updateField === 'serialNumber') {
      update = parseInt(update, 10);
    }
    if (updateField === 'friend' || updateField === 'killer') {
      update = update.trim().toLowerCase().startsWith('y');
    }

    await Robot.updateOne({ _id: updateTarget.trim() }, { $set: { [updateField]: update } });
    console.log('Your robot has been updated!');

  } else if (action === 'delete') {
    let allRobots = await Robot.find({});
    console.log(allRobots);

    let target = await ask('What is the ID of the entry you want to delete? ');
    await Robot.deleteOne({ _id: target.trim() });
    console.log('Your entry has been deleted');

  } else {
    console.log('Invalid entry, try again');
  }

  readlineInterface.close();
  process.exit();
}

start();
