const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Artifact = require('../models/Artifact');
const User = require('../models/User');
const Museum = require('../models/Museum');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360';

// Ensure upload directory exists and create a placeholder image
const UPLOAD_DIR = path.join(__dirname, '../uploads/artifacts/images');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Create a simple dummy image file (1x1 pixel JPEG) if it doesn't exist
const PLACEHOLDER_IMAGE = 'placeholder_artifact.jpg';
const PLACEHOLDER_PATH = path.join(UPLOAD_DIR, PLACEHOLDER_IMAGE);

// Minimal valid JPEG header
const dummyJpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00,
  0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03,
  0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01,
  0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d, 0x01, 0x02, 0x03,
  0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14,
  0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62,
  0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34,
  0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54,
  0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74,
  0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93,
  0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa,
  0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8,
  0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5,
  0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff,
  0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, 0xf9, 0xd4, 0xff,
  0xd9
]);

if (!fs.existsSync(PLACEHOLDER_PATH)) {
  fs.writeFileSync(PLACEHOLDER_PATH, dummyJpeg);
  console.log('Created placeholder image:', PLACEHOLDER_PATH);
}

const seedArtifacts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Museum Admin
    const museumAdmin = await User.findOne({ email: 'museum.admin@ethioheritage360.com' });
    if (!museumAdmin) {
      console.error('Museum Admin not found!');
      process.exit(1);
    }

    // Determine museum ID (either directly or created)
    let museumId = museumAdmin.museumId;

    // If no museum assigned yet, find or create one
    if (!museumId) {
      console.log('Museum Admin has no museumId, looking for a museum...');
      let museum = await Museum.findOne({ 'admin.user': museumAdmin._id });
      if (!museum) {
        museum = await Museum.findOne({}); // Fallback to any museum
        if (museum) console.log(`Falling back to museum: ${museum.name}`);
      }
      if (museum) museumId = museum._id;
    }

    if (!museumId) {
      console.error('No museum found for admin to attach artifacts to.');
      // Optional: Create a dummy museum if absolutely needed, but better to fail if structure is wrong
      // process.exit(1);
    }

    console.log(`Using Museum ID: ${museumId}`);

    // Delete existing artifacts for this museum (if any)
    const deleteResult = await Artifact.deleteMany({ museum: museumId });
    console.log(`Deleted ${deleteResult.deletedCount} old artifacts.`);

    // Ethiopian Artifacts Data
    const artifacts = [
      {
        name: 'Axum Obelisk Model',
        description: 'A scaled replica of the famous Obelisk of Axum, a 4th-century AD funerary stele.',
        category: 'sculptures',
        period: { era: 'ancient', startYear: 300, endYear: 400 },
        material: 'Granite',
        origin: { region: 'Axum, Tigray' },
        condition: 'excellent',
        status: 'on_display',
        isFragile: false,
        isOnDisplay: true,
        museum: museumId,
        accessionNumber: 'AX-001',
        seo: { slug: 'axum-obelisk-model-ax-001' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Axum Obelisk',
            isPrimary: true
          }]
        }
      },
      {
        name: 'Lalibela Processional Cross',
        description: 'An intricate brass processional cross from the rock-hewn churches of Lalibela.',
        category: 'religious-items',
        period: { era: 'medieval', startYear: 1100, endYear: 1200 },
        material: 'Brass',
        origin: { region: 'Lalibela, Amhara' },
        condition: 'good',
        status: 'on_display',
        isFragile: true,
        isOnDisplay: true,
        museum: museumId,
        accessionNumber: 'LA-001',
        seo: { slug: 'lalibela-processional-cross-la-001' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Lalibela Cross',
            isPrimary: true
          }]
        }
      },
      {
        name: 'Lucy (Australopithecus afarensis) Cast',
        description: 'A high-quality cast of the famous hominid fossil discovered in the Afar region.',
        category: 'other',
        period: { era: 'prehistoric', startYear: -3200000 },
        material: 'Plaster/Resin',
        origin: { region: 'Hadar, Afar' },
        condition: 'excellent',
        status: 'in_storage',
        isFragile: true,
        isOnDisplay: false,
        museum: museumId,
        accessionNumber: 'LU-001',
        seo: { slug: 'lucy-fossil-cast-lu-001' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Lucy Fossil',
            isPrimary: true
          }]
        }
      },
      {
        name: 'Emperor Fasilides Ceremonial Robe',
        description: 'A traditional ceremonial robe attributed to the Gonderine period.',
        category: 'textiles',
        period: { era: 'medieval', startYear: 1632, endYear: 1667 },
        material: 'Cotton, Silk',
        origin: { region: 'Gondar' },
        condition: 'fair',
        status: 'under_conservation',
        isFragile: true,
        isOnDisplay: false,
        museum: museumId,
        accessionNumber: 'GO-001',
        seo: { slug: 'emperor-fasilides-robe-go-001' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Royal Robe',
            isPrimary: true
          }]
        }
      },
      {
        name: 'Harari Basket (Mesob)',
        description: 'A colorful, hand-woven basket from Harar, used for serving food.',
        category: 'household-items',
        period: { era: 'modern', startYear: 1950 },
        material: 'Grass, Dye',
        origin: { region: 'Harar' },
        condition: 'good',
        status: 'on_display',
        isFragile: false,
        isOnDisplay: true,
        museum: museumId,
        accessionNumber: 'HA-001',
        seo: { slug: 'harari-basket-mesob-ha-001' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Harari Basket',
            isPrimary: true
          }]
        }
      },
      {
        name: 'Jimma Wood Carving (Chair)',
        description: 'A traditional three-legged wooden chair carved from a single piece of wood.',
        category: 'household-items',
        period: { era: 'contemporary', startYear: 2000 },
        material: 'Wood',
        origin: { region: 'Jimma, Oromia' },
        condition: 'good',
        status: 'on_loan',
        isFragile: false,
        isOnDisplay: false,
        museum: museumId,
        accessionNumber: 'JI-001',
        seo: { slug: 'jimma-wood-carving-chair-ji-001' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Jimma Chair',
            isPrimary: true
          }]
        }
      },
      {
        name: 'Ancient Coin of Ezana',
        description: 'Gold coin from the reign of King Ezana of Aksum. Symbolizes the transition to Christianity.',
        category: 'coins',
        period: { era: 'ancient', startYear: 330, endYear: 360 },
        material: 'Gold',
        origin: { region: 'Axum' },
        condition: 'excellent',
        status: 'on_display',
        isFragile: false,
        isOnDisplay: true,
        museum: museumId,
        accessionNumber: 'AX-002',
        seo: { slug: 'ancient-coin-ezana-ax-002' },
        createdBy: museumAdmin._id,
        media: {
          images: [{
            url: `/uploads/artifacts/images/${PLACEHOLDER_IMAGE}`,
            caption: 'Ezana Coin',
            isPrimary: true
          }]
        }
      }
    ];

    await Artifact.insertMany(artifacts);
    console.log(`Seeded ${artifacts.length} new Ethiopian artifacts.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding artifacts:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation Error on ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

seedArtifacts();
