// Real-World Workflow Examples
// Ethiopian Heritage 360 Platform

/**
 * SCENARIO 1: ARTIFACT SUBMISSION WORKFLOW
 * From creation to public visibility
 */

// Step 1: Museum Staff creates artifact (status: 'draft')
const createArtifact = async (staffUser, museumId) => {
  const artifact = {
    name: "Ancient Ethiopian Crown",
    description: "Royal crown from 15th century Solomonic dynasty",
    category: "Royal Artifacts",
    period: { era: "ancient", startYear: 1400, endYear: 1500 },
    museum: museumId,
    createdBy: staffUser._id,
    status: "draft",
    media: {
      images: [
        { url: "crown_front.jpg", caption: "Front view", isPrimary: true },
        { url: "crown_side.jpg", caption: "Side view" }
      ]
    }
  };
  
  console.log("STEP 1: Staff creates artifact");
  console.log("Status: DRAFT");
  console.log("Next: Museum Admin review");
  return artifact;
};

// Step 2: Museum Admin reviews and approves (status: 'pending-review')
const museumAdminApproval = async (artifact, museumAdmin) => {
  artifact.status = "pending-review"; // Sent to Super Admin
  artifact.reviews.push({
    reviewer: museumAdmin._id,
    status: "approved",
    feedback: "High-quality artifact, historically significant. Ready for platform approval.",
    reviewedAt: new Date(),
    level: "museum_admin"
  });
  
  // Send notification to Super Admin
  const notification = {
    type: "artifact_submission",
    title: "New Artifact Pending Review",
    message: `${artifact.museum.name} submitted "${artifact.name}" for approval`,
    recipient: "super_admin",
    priority: "medium",
    data: { artifactId: artifact._id }
  };
  
  console.log("STEP 2: Museum Admin approves");
  console.log("Status: PENDING-REVIEW (sent to Super Admin)");
  console.log("Next: Super Admin final approval");
  return { artifact, notification };
};

// Step 3: Super Admin final review (status: 'published' or 'rejected')
const superAdminFinalApproval = async (artifact, superAdmin, decision) => {
  if (decision === 'approved') {
    artifact.status = "published";
    artifact.visibility = "public";
    
    artifact.reviews.push({
      reviewer: superAdmin._id,
      status: "approved",
      feedback: "Approved for public display. Meets platform quality standards.",
      reviewedAt: new Date(),
      level: "final"
    });
    
    console.log("STEP 3: Super Admin approves");
    console.log("Status: PUBLISHED (visible to public)");
    console.log("Result: Artifact is now live on platform");
    
  } else {
    artifact.status = "rejected";
    
    artifact.reviews.push({
      reviewer: superAdmin._id,
      status: "rejected",
      feedback: "Image quality needs improvement. Please provide higher resolution photos and better lighting.",
      reviewedAt: new Date(),
      level: "final"
    });
    
    // Notify Museum Admin of rejection
    const feedback = {
      to: artifact.museum.admin,
      subject: "Artifact Submission Rejected",
      message: "Your artifact submission requires revisions. Please check feedback and resubmit.",
      actionRequired: true
    };
    
    console.log("STEP 3: Super Admin rejects");
    console.log("Status: REJECTED (back to Museum Admin)");
    console.log("Next: Museum Admin must revise and resubmit");
  }
  
  return artifact;
};

/**
 * SCENARIO 2: RENTAL REQUEST WORKFLOW
 * Two-level approval system
 */

// Step 1: Visitor requests rental
const createRentalRequest = async (visitor, artifactId) => {
  const rental = {
    artifact: artifactId,
    museum: "museum_id_from_artifact",
    renter: visitor._id,
    rentalType: "educational",
    purpose: "University of Addis Ababa history exhibition",
    requestedDuration: {
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-03-31"),
      duration: 30
    },
    location: {
      venue: "University Museum",
      address: "Addis Ababa University, Main Campus",
      city: "Addis Ababa",
      country: "Ethiopia"
    },
    pricing: {
      dailyRate: 1000,
      totalAmount: 30000,
      currency: "ETB"
    },
    status: "pending_review",
    approvals: {
      museumAdmin: { status: "pending" },
      superAdmin: { status: "pending" }
    }
  };
  
  console.log("RENTAL STEP 1: Visitor submits request");
  console.log("Status: PENDING_REVIEW");
  console.log("Next: Museum Admin initial review");
  return rental;
};

// Step 2: Museum Admin initial screening
const museumAdminRentalReview = async (rental, museumAdmin, decision) => {
  if (decision === 'approved') {
    rental.approvals.museumAdmin = {
      status: "approved",
      approvedBy: museumAdmin._id,
      approvedAt: new Date(),
      comments: "Legitimate educational purpose. University has good reputation."
    };
    rental.status = "pending_review"; // Forwarded to Super Admin
    
    console.log("RENTAL STEP 2: Museum Admin approves");
    console.log("Status: PENDING_REVIEW (forwarded to Super Admin)");
    console.log("Next: Super Admin final approval");
    
  } else {
    rental.approvals.museumAdmin = {
      status: "rejected",
      approvedBy: museumAdmin._id,
      approvedAt: new Date(),
      comments: "Insufficient insurance coverage. Please provide comprehensive coverage."
    };
    rental.status = "rejected";
    
    console.log("RENTAL STEP 2: Museum Admin rejects");
    console.log("Status: REJECTED (rental ended)");
    console.log("Reason: Museum Admin concerns");
  }
  
  return rental;
};

// Step 3: Super Admin final decision
const superAdminRentalApproval = async (rental, superAdmin, decision) => {
  if (decision === 'approved') {
    rental.approvals.superAdmin = {
      status: "approved",
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
      comments: "All requirements met. Approved for rental."
    };
    rental.status = "payment_pending";
    
    console.log("RENTAL STEP 3: Super Admin approves");
    console.log("Status: PAYMENT_PENDING");
    console.log("Next: Payment processing → Active rental");
    
  } else {
    rental.approvals.superAdmin = {
      status: "rejected",
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
      comments: "Rental period conflicts with major exhibition. Please select different dates."
    };
    rental.status = "rejected";
    
    console.log("RENTAL STEP 3: Super Admin rejects");
    console.log("Status: REJECTED (final decision)");
    console.log("Reason: Platform-level conflict");
  }
  
  return rental;
};

/**
 * SCENARIO 3: USER ROLE MANAGEMENT
 * Only Super Admin can change roles
 */

// Museum Admin tries to promote staff (FAILS)
const museumAdminTryPromoteStaff = async (museumAdmin, staffUser) => {
  try {
    // This would fail in middleware
    if (museumAdmin.role !== 'super_admin') {
      throw new Error('Access denied. Only Super Admin can change user roles.');
    }
    
    staffUser.role = 'museum_admin'; // This line never executes
    
  } catch (error) {
    console.log("ROLE CHANGE ATTEMPT: Museum Admin tries to promote staff");
    console.log("Result: DENIED");
    console.log("Error:", error.message);
    console.log("Rule: Only Super Admin can change user roles");
  }
};

// Super Admin promotes user (SUCCEEDS)
const superAdminPromoteUser = async (superAdmin, targetUser, newRole) => {
  if (superAdmin.role === 'super_admin') {
    const oldRole = targetUser.role;
    targetUser.role = newRole;
    targetUser.roleHistory = targetUser.roleHistory || [];
    targetUser.roleHistory.push({
      previousRole: oldRole,
      newRole: newRole,
      changedBy: superAdmin._id,
      changedAt: new Date(),
      reason: "Promoted by Super Admin"
    });
    
    console.log("ROLE CHANGE: Super Admin promotes user");
    console.log(`User: ${targetUser.name}`);
    console.log(`From: ${oldRole} → To: ${newRole}`);
    console.log("Result: SUCCESS");
    console.log("Authority: Super Admin has full user management control");
  }
  
  return targetUser;
};

/**
 * SCENARIO 4: ANALYTICS ACCESS DIFFERENCES
 * Different data scope based on role
 */

// Super Admin analytics (platform-wide)
const getSuperAdminAnalytics = async (superAdmin) => {
  const analytics = {
    scope: "PLATFORM-WIDE",
    data: {
      totalUsers: 15420,
      totalMuseums: 45,
      totalArtifacts: 8900,
      totalRentals: 234,
      monthlyRevenue: 2500000, // ETB
      topMuseums: [
        { name: "National Museum", artifacts: 1200, revenue: 450000 },
        { name: "Ethnological Museum", artifacts: 800, revenue: 380000 },
        { name: "Red Terror Museum", artifacts: 300, revenue: 120000 }
      ],
      usersByRole: {
        visitor: 14800,
        museum_admin: 45,
        museum: 120,
        organizer: 35,
        super_admin: 3
      },
      systemHealth: {
        uptime: "99.8%",
        avgResponseTime: "120ms",
        activeConnections: 1247
      }
    }
  };
  
  console.log("SUPER ADMIN ANALYTICS");
  console.log("Scope: Entire platform");
  console.log("Data: All museums, all users, all activities");
  console.log("Special Access: System health, user roles, financial data");
  
  return analytics;
};

// Museum Admin analytics (museum-specific)
const getMuseumAdminAnalytics = async (museumAdmin) => {
  const analytics = {
    scope: "MUSEUM-SPECIFIC",
    museumName: "National Museum",
    data: {
      totalArtifacts: 1200,
      publishedArtifacts: 1100,
      pendingArtifacts: 50,
      rejectedArtifacts: 20,
      monthlyVisitors: 12500,
      popularArtifacts: [
        { name: "Lucy Fossil", views: 2340 },
        { name: "Aksum Obelisk Model", views: 1890 },
        { name: "Traditional Jewelry", views: 1450 }
      ],
      rentalRequests: {
        pending: 8,
        approved: 23,
        active: 12,
        revenue: 450000 // Only their museum's revenue
      },
      staffActivity: {
        totalStaff: 15,
        activeStaff: 12,
        recentSubmissions: 8
      }
    },
    restrictions: [
      "Cannot see other museums' data",
      "Cannot see platform-wide statistics", 
      "Cannot see user role distribution",
      "Cannot see system health metrics"
    ]
  };
  
  console.log("MUSEUM ADMIN ANALYTICS");
  console.log("Scope: Only their museum");
  console.log("Museum:", analytics.museumName);
  console.log("Restrictions: Cannot access other museums or platform data");
  
  return analytics;
};

/**
 * SCENARIO 5: NOTIFICATION DIFFERENCES
 * Different notification types and priorities
 */

// Super Admin notifications (platform-wide)
const getSuperAdminNotifications = async (superAdmin) => {
  const notifications = [
    {
      id: 1,
      type: "system_alert",
      priority: "high",
      title: "Database Backup Failed",
      message: "Automated backup failed at 2:00 AM. Manual intervention required.",
      timestamp: new Date("2024-01-15T02:15:00Z"),
      category: "system"
    },
    {
      id: 2,
      type: "approval_required",
      priority: "medium",
      title: "12 Artifacts Pending Approval",
      message: "Multiple museums have submitted artifacts for final review",
      timestamp: new Date("2024-01-15T09:30:00Z"),
      category: "content_moderation"
    },
    {
      id: 3,
      type: "user_management",
      priority: "low",
      title: "New Museum Registration",
      message: "Bahir Dar Museum has registered and requires verification",
      timestamp: new Date("2024-01-15T14:20:00Z"),
      category: "museum_oversight"
    },
    {
      id: 4,
      type: "financial_alert", 
      priority: "medium",
      title: "Monthly Revenue Target Achieved",
      message: "Platform revenue exceeded target by 15% this month",
      timestamp: new Date("2024-01-15T16:45:00Z"),
      category: "analytics"
    }
  ];
  
  console.log("SUPER ADMIN NOTIFICATIONS");
  console.log("Types: System alerts, platform-wide approvals, financial data");
  console.log("Scope: All museums, all systems, all users");
  
  return notifications;
};

// Museum Admin notifications (museum-specific)
const getMuseumAdminNotifications = async (museumAdmin) => {
  const notifications = [
    {
      id: 1,
      type: "feedback_received",
      priority: "high",
      title: "Artifact Rejected by Super Admin",
      message: "Your 'Ancient Manuscript' submission needs image quality improvements",
      timestamp: new Date("2024-01-15T10:30:00Z"),
      category: "content_feedback",
      actionRequired: true
    },
    {
      id: 2,
      type: "rental_request",
      priority: "medium",
      title: "New Rental Request",
      message: "University of Gondar wants to rent 'Traditional Coffee Set' for 14 days",
      timestamp: new Date("2024-01-15T13:15:00Z"),
      category: "rental_management"
    },
    {
      id: 3,
      type: "staff_activity",
      priority: "low",
      title: "Staff Submitted 3 New Artifacts",
      message: "Your curators have uploaded new items requiring your review",
      timestamp: new Date("2024-01-15T15:45:00Z"),
      category: "staff_management"
    },
    {
      id: 4,
      type: "visitor_milestone",
      priority: "low", 
      title: "Monthly Visitor Goal Reached",
      message: "Your museum had 12,500 visitors this month - 25% above target!",
      timestamp: new Date("2024-01-15T17:00:00Z"),
      category: "achievement"
    }
  ];
  
  console.log("MUSEUM ADMIN NOTIFICATIONS");
  console.log("Types: Artifact feedback, rental requests, staff activity");
  console.log("Scope: Only their museum and related activities");
  
  return notifications;
};

// Example execution
const runWorkflowExamples = async () => {
  console.log("=".repeat(60));
  console.log("ETHIOPIAN HERITAGE 360 - WORKFLOW EXAMPLES");
  console.log("=".repeat(60));
  
  // Mock users
  const superAdmin = { _id: "admin1", role: "super_admin", name: "System Admin" };
  const museumAdmin = { _id: "madmin1", role: "museum_admin", name: "Museum Director" };
  const visitor = { _id: "visitor1", role: "visitor", name: "Student Researcher" };
  
  // Run artifact workflow
  console.log("\n1. ARTIFACT SUBMISSION WORKFLOW");
  console.log("-".repeat(40));
  let artifact = await createArtifact({ _id: "staff1" }, "museum1");
  const approval = await museumAdminApproval(artifact, museumAdmin);
  artifact = approval.artifact;
  await superAdminFinalApproval(artifact, superAdmin, 'approved');
  
  // Run rental workflow
  console.log("\n2. RENTAL REQUEST WORKFLOW");
  console.log("-".repeat(40));
  let rental = await createRentalRequest(visitor, "artifact1");
  rental = await museumAdminRentalReview(rental, museumAdmin, 'approved');
  await superAdminRentalApproval(rental, superAdmin, 'approved');
  
  // Role management example
  console.log("\n3. USER ROLE MANAGEMENT");
  console.log("-".repeat(40));
  const staff = { _id: "staff1", role: "museum", name: "Curator" };
  await museumAdminTryPromoteStaff(museumAdmin, staff);
  await superAdminPromoteUser(superAdmin, staff, 'museum_admin');
  
  // Analytics comparison
  console.log("\n4. ANALYTICS ACCESS COMPARISON");
  console.log("-".repeat(40));
  await getSuperAdminAnalytics(superAdmin);
  console.log("");
  await getMuseumAdminAnalytics(museumAdmin);
  
  // Notifications comparison
  console.log("\n5. NOTIFICATION DIFFERENCES");
  console.log("-".repeat(40));
  await getSuperAdminNotifications(superAdmin);
  console.log("");
  await getMuseumAdminNotifications(museumAdmin);
  
  console.log("\n" + "=".repeat(60));
  console.log("WORKFLOW EXAMPLES COMPLETE");
  console.log("=".repeat(60));
};

// Export for use
module.exports = {
  createArtifact,
  museumAdminApproval, 
  superAdminFinalApproval,
  createRentalRequest,
  museumAdminRentalReview,
  superAdminRentalApproval,
  getSuperAdminAnalytics,
  getMuseumAdminAnalytics,
  runWorkflowExamples
};
