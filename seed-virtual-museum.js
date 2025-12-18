const mongoose = require('mongoose');
const Artifact = require('./server/models/Artifact');
const Museum = require('./server/models/Museum');
const VirtualMuseum = require('./server/models/VirtualMuseum');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const seedVirtualMuseum = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const museums = await Museum.find().limit(3);
    const artifacts = await Artifact.find().limit(5);

    if (museums.length === 0 || artifacts.length === 0) {
      console.log('No museums or artifacts found to link. Please ensure basic data exists.');
      process.exit(1);
    }

    const items = [
      {
        artifact: artifacts[0]._id,
        museum: museums[0]._id,
        title: 'Aksum Obelisk (3D Experience)',
        description: 'Examine the majestic Aksum Obelisk in stunning 3D. Learn about the ancient Kingdom of Aksum and its architectural marvels.',
        category: 'Ancient Monuments',
        period: '4th Century AD',
        origin: 'Aksum, Ethiopia',
        has3DModel: true,
        modelUrl: '/images/aksum.png',
        featured: true,
        status: 'active',
        displayOrder: 1
      },
      {
        artifact: artifacts[Math.min(1, artifacts.length - 1)]._id,
        museum: museums[Math.min(1, museums.length - 1)]._id,
        title: 'Imperial Crown of Ethiopia',
        description: 'A virtual close-up of the royal crown. Explore the intricate details of Ethiopian imperial craftsmanship.',
        category: 'Royal Heritage',
        period: '20th Century',
        origin: 'Addis Ababa',
        has3DModel: true,
        modelUrl: '/images/crown.png',
        featured: true,
        status: 'active',
        displayOrder: 2
      }
    ];

    await VirtualMuseum.deleteMany({}); // Optional: clear existing
    await VirtualMuseum.insertMany(items);

    console.log('Virtual Museum seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedVirtualMuseum();
