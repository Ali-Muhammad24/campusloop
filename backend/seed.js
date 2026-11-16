// Fills the database with demo data. Run it with: npm run seed
// It removes everything first, so the database always ends up in the same starting state.

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Request = require('./models/Request');

async function seed() {
  await connectDB();

  await Request.deleteMany({});
  await Equipment.deleteMany({});
  await User.deleteMany({});

  // Passwords are stored hashed, never as plain text.
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Signup only creates students, so the Admin account is created here.
  const [admin, student1, student2] = await User.create([
    { name: 'Demo Admin', email: 'admin@campusloop.test', password: adminPassword, role: 'Admin' },
    { name: 'Demo Student One', email: 'student1@campusloop.test', password: studentPassword, role: 'Student' },
    { name: 'Demo Student Two', email: 'student2@campusloop.test', password: studentPassword, role: 'Student' },
  ]);

  const [dell, macbook, canon, gopro, tripod, microphone, speaker, multimeter, arduino, projector] =
    await Equipment.insertMany([
      { name: 'Dell Latitude Laptop', category: 'Laptops', description: '14-inch laptop with 16GB RAM, good for coding and assignments.', availability: 'Borrowed' },
      { name: 'MacBook Air', category: 'Laptops', description: '13-inch laptop, light and long battery life.' },
      { name: 'Canon DSLR Camera', category: 'Cameras', description: 'DSLR camera with 18-55mm lens and charger.', availability: 'Borrowed' },
      { name: 'GoPro Action Camera', category: 'Cameras', description: 'Small waterproof camera for sports and field work.' },
      { name: 'Camera Tripod', category: 'Cameras', description: 'Adjustable tripod that fits most cameras and phones.' },
      { name: 'Wireless Microphone Set', category: 'Audio', description: 'Two clip-on microphones with a receiver.' },
      { name: 'Bluetooth Speaker', category: 'Audio', description: 'Portable speaker for presentations and events.' },
      { name: 'Digital Multimeter', category: 'Lab Equipment', description: 'Measures voltage, current and resistance.' },
      { name: 'Arduino Starter Kit', category: 'Lab Equipment', description: 'Arduino board with sensors, wires and a breadboard.' },
      { name: 'Old Projector', category: 'Lab Equipment', description: 'Older projector, no longer lent out.', isActive: false },
    ]);

  // One request in every status, so each part of the flow can be shown in the demo.
  // insertMany saves the documents in the order they are written here.
  await Request.insertMany([
    // Approved: this is why the Dell laptop is Borrowed.
    { studentId: student1._id, equipmentId: dell._id, purpose: 'Final year project work', expectedReturnDate: '2026-11-28', status: 'Approved' },
    // Approved: this is why the Canon camera is Borrowed.
    { studentId: student2._id, equipmentId: canon._id, purpose: 'Photography club event', expectedReturnDate: '2026-11-26', status: 'Approved' },
    // Pending on a Borrowed item: the admin cannot approve this until the laptop is returned.
    { studentId: student2._id, equipmentId: dell._id, purpose: 'Programming lab assignment', expectedReturnDate: '2026-12-05', status: 'Pending' },
    // Pending on an Available item: the admin can approve this one.
    { studentId: student1._id, equipmentId: microphone._id, purpose: 'Recording a podcast for class', expectedReturnDate: '2026-11-30', status: 'Pending' },
    { studentId: student1._id, equipmentId: gopro._id, purpose: 'Personal trip', expectedReturnDate: '2026-10-25', status: 'Rejected' },
    // Returned: the inactive projector has a request, so it cannot be deleted.
    { studentId: student2._id, equipmentId: projector._id, purpose: 'Group presentation', expectedReturnDate: '2026-10-10', status: 'Returned' },
  ]);

  console.log('Database seeded: 3 users, 10 equipment items, 6 requests');
  console.log(`Admin login: ${admin.email} / admin123`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
