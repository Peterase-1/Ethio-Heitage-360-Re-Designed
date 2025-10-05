const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Museum = require('../models/Museum'); 
const Communication = require('../models/Communication');

const seedCommunications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB for seeding communications...');

    // Clear existing communications
    await Communication.deleteMany({});
    console.log('🗑️ Cleared existing communications');

    // First, let's create a super admin and museum admin if they don't exist
    let superAdmin = await User.findOne({ role: 'superAdmin' });
    if (!superAdmin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      superAdmin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        name: 'Super Admin',
        email: 'superadmin@ethioheritage360.com',
        password: hashedPassword,
        role: 'superAdmin',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Created Super Admin user');
    }

    // Create museum admins if they don't exist
    const museumAdminsData = [
      {
        firstName: 'National Museum',
        lastName: 'Admin',
        name: 'National Museum Admin',
        email: 'national.museum@ethioheritage360.com',
        museumName: 'National Museum of Ethiopia'
      },
      {
        firstName: 'Ethnological Museum',
        lastName: 'Admin', 
        name: 'Ethnological Museum Admin',
        email: 'ethnological.museum@ethioheritage360.com',
        museumName: 'Institute of Ethiopian Studies'
      },
      {
        firstName: 'Red Terror Museum',
        lastName: 'Admin',
        name: 'Red Terror Museum Admin', 
        email: 'redterror.museum@ethioheritage360.com',
        museumName: 'Red Terror Martyrs Memorial Museum'
      }
    ];

    const museumAdmins = [];
    for (const adminData of museumAdminsData) {
      let museumAdmin = await User.findOne({ email: adminData.email });
      if (!museumAdmin) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('museum123', 12);
        
        museumAdmin = await User.create({
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          name: adminData.name,
          email: adminData.email,
          password: hashedPassword,
          role: 'museumAdmin',
          isActive: true,
          isVerified: true
        });
        console.log(`✅ Created Museum Admin: ${adminData.name}`);
      }
      
      // Create or find associated museum
      let museum = await Museum.findOne({ admin: museumAdmin._id });
      if (!museum) {
        museum = await Museum.create({
          name: adminData.museumName,
          description: `Description for ${adminData.museumName}`,
          location: {
            type: 'Point',
            coordinates: [38.7578, 9.0320], // Addis Ababa coordinates
            address: `${adminData.museumName} Address, Addis Ababa`,
            city: 'Addis Ababa',
            region: 'Addis Ababa',
            country: 'Ethiopia'
          },
          contactInfo: {
            phone: '+251-11-123-4567',
            email: adminData.email,
            website: `https://www.${adminData.museumName.toLowerCase().replace(/\s+/g, '')}.com`
          },
          admin: museumAdmin._id,
          status: 'approved',
          verified: true,
          operatingHours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { closed: true }
          }
        });
        console.log(`✅ Created Museum: ${adminData.museumName}`);
      }
      
      museumAdmins.push({ user: museumAdmin, museum });
    }

    // Sample communication data with realistic museum admin scenarios
    const communicationTypes = [
      {
        type: 'inquiry',
        from: museumAdmins[0].user._id,
        to: superAdmin._id,
        museum: museumAdmins[0].museum._id,
        subject: 'Request for Additional Storage Space Authorization',
        message: 'Dear Super Admin, we are experiencing a significant increase in artifact donations and acquisitions. Our current storage facility is at 95% capacity. We would like to request authorization to expand our storage area or acquire additional off-site storage. Could we schedule a meeting to discuss the budget implications and approval process?',
        priority: 'high',
        status: 'sent',
        tags: ['storage', 'expansion', 'budget']
      },
      {
        type: 'request',
        from: museumAdmins[1].user._id,
        to: superAdmin._id,
        museum: museumAdmins[1].museum._id,
        subject: 'Staff Training Budget Approval Request',
        message: 'Hello, I hope this message finds you well. We have identified a need for specialized training for our curatorial staff in digital archiving and artifact preservation techniques. The training program costs $5,000 and would benefit 8 staff members. This investment would significantly improve our collection management capabilities. Please let me know what documentation is needed for approval.',
        priority: 'medium',
        status: 'read',
        tags: ['training', 'staff-development', 'budget-request'],
        readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        internalNotes: 'Reviewed training curriculum - looks comprehensive and valuable for team development'
      },
      {
        type: 'announcement',
        from: superAdmin._id,
        to: museumAdmins[0].user._id,
        museum: museumAdmins[0].museum._id,
        subject: 'New Digital Archive System Implementation',
        message: 'Important Update: We will be implementing a new digital archive system across all museums starting next month. This system will provide better artifact tracking, visitor analytics, and inventory management. Training sessions will be scheduled for all museum administrators. Please prepare your staff for the transition and let me know your preferred training dates.',
        priority: 'high',
        status: 'delivered',
        tags: ['system-update', 'training', 'digital-transformation']
      },
      {
        type: 'feedback',
        from: museumAdmins[2].user._id,
        to: superAdmin._id,
        museum: museumAdmins[2].museum._id,
        subject: 'Visitor Experience Enhancement Suggestions',
        message: 'Based on recent visitor feedback and our quarterly analysis, I would like to propose several enhancements to improve visitor experience: 1) Interactive digital displays for historical context, 2) Audio guides in multiple languages including Amharic and Oromo, 3) Virtual reality experience for key historical events. I have compiled a detailed proposal with cost estimates and expected impact. Would you like to schedule a presentation?',
        priority: 'medium',
        status: 'sent',
        tags: ['visitor-experience', 'technology', 'proposal']
      },
      {
        type: 'inquiry',
        from: museumAdmins[1].user._id,
        to: superAdmin._id,
        museum: museumAdmins[1].museum._id,
        subject: 'Security System Upgrade Requirements',
        message: 'Our current security system needs urgent attention. We have had several minor incidents and our insurance company has recommended upgrading to a more comprehensive system. I need guidance on approved vendors and budget allocation for security infrastructure. The estimated cost is $15,000 for a complete system upgrade including cameras, motion sensors, and access control.',
        priority: 'urgent',
        status: 'sent',
        tags: ['security', 'infrastructure', 'insurance']
      },
      {
        type: 'response',
        from: superAdmin._id,
        to: museumAdmins[0].user._id,
        museum: museumAdmins[0].museum._id,
        subject: 'Re: Request for Additional Storage Space Authorization',
        message: 'Thank you for your detailed request. I have reviewed your storage utilization reports and visitor projections. The expansion is approved in principle. Please submit a formal proposal with: 1) Detailed floor plans, 2) Cost breakdown, 3) Timeline for implementation, 4) Impact on daily operations. Once received, we can fast-track the approval process. Budget allocation looks favorable for Q2.',
        priority: 'high',
        status: 'sent',
        isResponse: true,
        parentMessage: null, // Will be set after creating the original message
        tags: ['approved', 'expansion', 'next-steps']
      },
      {
        type: 'announcement',
        from: superAdmin._id,
        to: museumAdmins[1].user._id,
        subject: 'Updated Heritage Site Guidelines',
        message: 'New guidelines for heritage site documentation and preservation have been released by the Ministry of Culture. All museums must ensure compliance by the end of this quarter. Key updates include enhanced documentation standards, visitor capacity limits, and emergency preservation protocols. Please review the attached guidelines and confirm your compliance timeline.',
        priority: 'medium',
        status: 'sent',
        tags: ['compliance', 'guidelines', 'heritage-preservation']
      },
      {
        type: 'request',
        from: museumAdmins[2].user._id,
        to: superAdmin._id,
        museum: museumAdmins[2].museum._id,
        subject: 'Special Exhibition Approval - Contemporary Ethiopian Art',
        message: 'I would like to request approval for a special exhibition featuring contemporary Ethiopian artists alongside our historical collections. The exhibition "Past Meets Present: Ethiopian Artistic Evolution" would run for 3 months and showcase how traditional art forms influence modern expressions. We have partnerships with 15 local artists and the Ethiopian Art Academy. Expected additional visitors: 2000+. Budget needed: $8,000.',
        priority: 'medium',
        status: 'sent',
        tags: ['exhibition', 'contemporary-art', 'collaboration']
      }
    ];

    // Create communications
    const createdCommunications = [];
    for (const commData of communicationTypes) {
      // Add some variation to creation dates
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      const communication = await Communication.create({
        ...commData,
        sentAt: createdAt,
        createdAt: createdAt
      });
      
      createdCommunications.push(communication);
    }

    // Create some reply communications
    const originalMessage = createdCommunications[0]; // Storage space request
    await Communication.create({
      type: 'response',
      from: superAdmin._id,
      to: originalMessage.from,
      museum: originalMessage.museum,
      subject: `Re: ${originalMessage.subject}`,
      message: 'Thank you for your detailed request. I have reviewed your storage utilization reports and visitor projections. The expansion is approved in principle. Please submit a formal proposal with: 1) Detailed floor plans, 2) Cost breakdown, 3) Timeline for implementation, 4) Impact on daily operations. Budget allocation looks favorable for Q2.',
      priority: 'high',
      status: 'sent',
      isResponse: true,
      parentMessage: originalMessage._id,
      tags: ['approved', 'expansion', 'next-steps'],
      sentAt: new Date(originalMessage.sentAt.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after original
      createdAt: new Date(originalMessage.sentAt.getTime() + 2 * 24 * 60 * 60 * 1000)
    });

    // Follow-up from museum admin
    await Communication.create({
      type: 'response',
      from: originalMessage.from,
      to: superAdmin._id,
      museum: originalMessage.museum,
      subject: `Re: ${originalMessage.subject}`,
      message: 'Thank you for the quick approval! I have already started working on the detailed proposal. Our architect will have the floor plans ready by Friday, and I am getting quotes from three different contractors. I estimate we can have the complete proposal to you by next Tuesday. Should I also include plans for climate control in the new storage area?',
      priority: 'medium',
      status: 'sent',
      isResponse: true,
      parentMessage: originalMessage._id,
      tags: ['progress-update', 'timeline', 'climate-control'],
      sentAt: new Date(originalMessage.sentAt.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days after original
      createdAt: new Date(originalMessage.sentAt.getTime() + 4 * 24 * 60 * 60 * 1000)
    });

    // Training request reply
    const trainingRequest = createdCommunications[1];
    await Communication.create({
      type: 'response',
      from: superAdmin._id,
      to: trainingRequest.from,
      museum: trainingRequest.museum,
      subject: `Re: ${trainingRequest.subject}`,
      message: 'Your training request has been reviewed and approved. The digital archiving training will be valuable for your team and aligns with our platform modernization goals. Please submit the training provider details, schedule, and invoice to the finance department. Also, please plan to share the learnings with other museum administrators in our next quarterly meeting.',
      priority: 'medium',
      status: 'sent',
      isResponse: true,
      parentMessage: trainingRequest._id,
      tags: ['approved', 'training', 'knowledge-sharing'],
      sentAt: new Date(trainingRequest.sentAt.getTime() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(trainingRequest.sentAt.getTime() + 1 * 24 * 60 * 60 * 1000)
    });

    console.log(`✅ Created ${createdCommunications.length + 3} communications between museum admins and super admin`);

    // Create some unread communications for testing
    await Communication.create({
      type: 'announcement',
      from: superAdmin._id,
      to: museumAdmins[0].user._id,
      museum: museumAdmins[0].museum._id,
      subject: 'Urgent: System Maintenance Scheduled',
      message: 'System maintenance is scheduled for this Saturday from 2:00 AM to 6:00 AM. During this time, the digital archive system will be unavailable. Please ensure all critical data is backed up and inform your staff about the temporary service interruption.',
      priority: 'urgent',
      status: 'sent', // Unread
      tags: ['maintenance', 'system-downtime'],
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    });

    await Communication.create({
      type: 'inquiry',
      from: museumAdmins[2].user._id,
      to: superAdmin._id,
      museum: museumAdmins[2].museum._id,
      subject: 'Question about Artifact Loan Policy',
      message: 'We have received a request from an international museum to borrow one of our significant artifacts for a 6-month exhibition. What is the current policy for international loans, and what documentation is required? The requesting museum has excellent credentials and insurance coverage.',
      priority: 'medium',
      status: 'sent', // Unread
      tags: ['international-loan', 'policy', 'artifact-sharing'],
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    });

    console.log('✅ Created additional unread communications for testing');

    console.log('\n📊 Communication Seeding Summary:');
    console.log(`- Super Admin: ${superAdmin.name} (${superAdmin.email})`);
    console.log(`- Museum Admins: ${museumAdmins.length}`);
    museumAdmins.forEach(ma => {
      console.log(`  - ${ma.user.name} (${ma.user.email}) - ${ma.museum.name}`);
    });
    
    const totalComms = await Communication.countDocuments();
    const unreadComms = await Communication.countDocuments({ status: { $in: ['sent', 'delivered'] } });
    console.log(`- Total Communications: ${totalComms}`);
    console.log(`- Unread Communications: ${unreadComms}`);

    console.log('\n🎯 Test the museum communications by:');
    console.log('1. Logging in as a museum admin:');
    console.log('   - Email: national.museum@ethioheritage360.com');
    console.log('   - Password: museum123');
    console.log('2. Navigate to Communications Center');
    console.log('3. View conversations between museum admin and super admin');

  } catch (error) {
    console.error('❌ Error seeding communications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed script
if (require.main === module) {
  seedCommunications();
}

module.exports = seedCommunications;
