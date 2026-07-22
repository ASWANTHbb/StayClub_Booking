// seed.js — Seeds MongoDB Atlas with all 20 dummy bookings
// Run with: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Booking = require('./models/Booking');

// ─────────────────────────────────────────────────────────────
// All 20 bookings from the Angular dummy-bookings.ts file
// ─────────────────────────────────────────────────────────────
const SEED_BOOKINGS = [
  {
    bookingId: 'B001',
    customerName: 'John Doe',
    propertyName: "River Vill'e",
    adults: 2, children: 1,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-14',
    totalPayment: 450, advanceAmount: 450, checkInTime: '11:30 AM',
  },
  {
    bookingId: 'B002',
    customerName: 'Alice Smith',
    propertyName: 'Luna Nest',
    adults: 2, children: 0,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-13',
    totalPayment: 300, advanceAmount: 100, checkInTime: '02:00 PM',
  },
  {
    bookingId: 'B003',
    customerName: 'Michael Johnson',
    propertyName: 'Kent',
    adults: 4, children: 2,
    checkInDate: '2026-07-09', checkOutDate: '2026-07-12',
    totalPayment: 800, advanceAmount: 800, checkInTime: '01:15 PM',
  },
  {
    bookingId: 'B004',
    customerName: 'Emma Watson',
    propertyName: "Pool Vill'e",
    adults: 2, children: 2,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-15',
    totalPayment: 600, advanceAmount: 200, checkInTime: '03:45 PM',
  },
  {
    bookingId: 'B005',
    customerName: 'David Brown',
    propertyName: 'Nilgiri Paradise',
    adults: 1, children: 0,
    checkInDate: '2026-07-10', checkOutDate: '2026-07-12',
    totalPayment: 180, advanceAmount: 180, checkInTime: '12:00 PM',
  },
  {
    bookingId: 'B006',
    customerName: 'Sophia Loren',
    propertyName: 'WoodHouse',
    adults: 3, children: 1,
    checkInDate: '2026-07-12', checkOutDate: '2026-07-16',
    totalPayment: 500, advanceAmount: 250, checkInTime: '02:30 PM',
  },
  {
    bookingId: 'B007',
    customerName: 'James Bond',
    propertyName: 'Container Home',
    adults: 2, children: 0,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-13',
    totalPayment: 220, advanceAmount: 0, checkInTime: '09:00 AM',
  },
  {
    bookingId: 'B008',
    customerName: 'Clara Oswald',
    propertyName: "River Vill'e",
    adults: 2, children: 0,
    checkInDate: '2026-07-15', checkOutDate: '2026-07-18',
    totalPayment: 450, advanceAmount: 450, checkInTime: '10:00 AM',
  },
  {
    bookingId: 'B009',
    customerName: 'Robert Downey',
    propertyName: 'Luna Nest',
    adults: 2, children: 1,
    checkInDate: '2026-07-14', checkOutDate: '2026-07-17',
    totalPayment: 450, advanceAmount: 150, checkInTime: '11:45 AM',
  },
  {
    bookingId: 'B010',
    customerName: 'Chris Evans',
    propertyName: 'Kent',
    adults: 3, children: 0,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-13',
    totalPayment: 400, advanceAmount: 400, checkInTime: '04:15 PM',
  },
  {
    bookingId: 'B011',
    customerName: 'Scarlett Johansson',
    propertyName: "Pool Vill'e",
    adults: 4, children: 3,
    checkInDate: '2026-07-16', checkOutDate: '2026-07-20',
    totalPayment: 1050, advanceAmount: 500, checkInTime: '01:00 PM',
  },
  {
    bookingId: 'B012',
    customerName: 'Mark Ruffalo',
    propertyName: 'Nilgiri Paradise',
    adults: 2, children: 2,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-15',
    totalPayment: 720, advanceAmount: 720, checkInTime: '05:00 PM',
  },
  {
    bookingId: 'B013',
    customerName: 'Tom Holland',
    propertyName: 'WoodHouse',
    adults: 2, children: 0,
    checkInDate: '2026-07-08', checkOutDate: '2026-07-11',
    totalPayment: 250, advanceAmount: 100, checkInTime: '10:30 AM',
  },
  {
    bookingId: 'B014',
    customerName: 'Zendaya Coleman',
    propertyName: 'Container Home',
    adults: 1, children: 1,
    checkInDate: '2026-07-13', checkOutDate: '2026-07-15',
    totalPayment: 220, advanceAmount: 220, checkInTime: '11:00 AM',
  },
  {
    bookingId: 'B015',
    customerName: 'Benedict Cumberbatch',
    propertyName: "River Vill'e",
    adults: 5, children: 0,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-13',
    totalPayment: 600, advanceAmount: 300, checkInTime: '12:30 PM',
  },
  {
    bookingId: 'B016',
    customerName: 'Elizabeth Olsen',
    propertyName: 'Luna Nest',
    adults: 2, children: 2,
    checkInDate: '2026-07-18', checkOutDate: '2026-07-22',
    totalPayment: 600, advanceAmount: 600, checkInTime: '02:00 PM',
  },
  {
    bookingId: 'B017',
    customerName: 'Brie Larson',
    propertyName: 'Kent',
    adults: 2, children: 0,
    checkInDate: '2026-07-20', checkOutDate: '2026-07-23',
    totalPayment: 600, advanceAmount: 200, checkInTime: '03:00 PM',
  },
  {
    bookingId: 'B018',
    customerName: 'Chadwick Boseman',
    propertyName: "Pool Vill'e",
    adults: 3, children: 1,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-14',
    totalPayment: 450, advanceAmount: 450, checkInTime: '01:30 PM',
  },
  {
    bookingId: 'B019',
    customerName: 'Paul Rudd',
    propertyName: 'Nilgiri Paradise',
    adults: 2, children: 1,
    checkInDate: '2026-07-22', checkOutDate: '2026-07-25',
    totalPayment: 540, advanceAmount: 200, checkInTime: '04:00 PM',
  },
  {
    bookingId: 'B020',
    customerName: 'Loki Laufeyson',
    propertyName: 'WoodHouse',
    adults: 1, children: 0,
    checkInDate: '2026-07-11', checkOutDate: '2026-07-12',
    totalPayment: 125, advanceAmount: 0, checkInTime: '06:00 PM',
  },
];

// ─────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  await connectDB();

  console.log('\n🌱 Starting database seed...\n');

  // Drop existing bookings to avoid duplicate key errors on re-seed
  const deleted = await Booking.deleteMany({});
  console.log(`🗑  Cleared ${deleted.deletedCount} existing booking(s)`);

  // Insert all bookings — balancePayment auto-calculated by pre-save hook
  const inserted = await Booking.insertMany(SEED_BOOKINGS);
  console.log(`✅ Inserted ${inserted.length} bookings into MongoDB Atlas\n`);

  // Print a quick summary
  console.log('── Seeded Bookings ──────────────────────────');
  inserted.forEach(b => {
    console.log(
      `  ${b.bookingId}  ${b.customerName.padEnd(25)} ${b.propertyName}`
    );
  });
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB Atlas. Seed complete!\n');
};

seedDatabase().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
