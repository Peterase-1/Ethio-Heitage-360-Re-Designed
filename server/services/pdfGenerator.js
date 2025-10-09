const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.ensureReportsDirectory();
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Generate a simple HTML-based PDF report
  generateSystemReport(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `system-report-${timestamp}.html`;
    const filepath = path.join(this.reportsDir, filename);

    const html = this.generateSystemReportHTML(data);

    fs.writeFileSync(filepath, html, 'utf8');

    return {
      filename,
      filepath,
      downloadUrl: `/api/system-settings/reports/download/${filename}`
    };
  }

  generateSystemReportHTML(data) {
    const {
      systemSettings = {},
      systemHealth = {},
      statistics = {},
      generatedAt = new Date()
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ethiopian Heritage 360 - System Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #3B82F6, #1E40AF);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .section {
            background: white;
            margin-bottom: 25px;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #3B82F6;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3B82F6;
        }
        .card h3 {
            margin-top: 0;
            color: #1E40AF;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
        }
        .status.healthy {
            background: #d4edda;
            color: #155724;
        }
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .feature-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: #e9ecef;
            border-radius: 6px;
        }
        .feature-item.enabled {
            background: #d4edda;
            color: #155724;
        }
        .feature-item.disabled {
            background: #f8d7da;
            color: #721c24;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #3B82F6;
        }
        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #6c757d;
        }
        @media print {
            body { background-color: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ethiopian Heritage 360</h1>
        <p>System Report - ${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString()}</p>
    </div>

    <div class="section">
        <h2>System Health Status</h2>
        <div class="grid">
            <div class="card">
                <h3>Database Status</h3>
                <span class="status ${systemHealth.database?.status || 'unknown'}">
                    ${systemHealth.database?.status || 'Unknown'}
                </span>
                <p>Last backup: ${systemHealth.database?.lastBackup ? new Date(systemHealth.database.lastBackup).toLocaleString() : 'Not available'}</p>
            </div>
            <div class="card">
                <h3>Maintenance Mode</h3>
                <span class="status ${systemHealth.maintenance?.mode ? 'warning' : 'healthy'}">
                    ${systemHealth.maintenance?.mode ? 'Active' : 'Normal'}
                </span>
                <p>System is ${systemHealth.maintenance?.mode ? 'under maintenance' : 'operational'}</p>
            </div>
            <div class="card">
                <h3>Active Features</h3>
                <div class="stat-number">${Object.values(systemHealth.features || {}).filter(Boolean).length}</div>
                <div class="stat-label">Features Enabled</div>
            </div>
            <div class="card">
                <h3>Security Level</h3>
                <span class="status ${systemHealth.security?.twoFactorRequired ? 'healthy' : 'warning'}">
                    ${systemHealth.security?.twoFactorRequired ? 'Enhanced' : 'Standard'}
                </span>
                <p>Session timeout: ${systemHealth.security?.sessionTimeout || 30} minutes</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Platform Configuration</h2>
        <div class="grid">
            <div class="card">
                <h3>Platform Information</h3>
                <p><strong>Name:</strong> ${systemSettings.platform?.name || 'Ethiopian Heritage 360'}</p>
                <p><strong>Version:</strong> ${systemSettings.platform?.version || '1.0.0'}</p>
                <p><strong>Default Language:</strong> ${systemSettings.platform?.defaultLanguage || 'English'}</p>
                <p><strong>Max Upload Size:</strong> ${systemSettings.platform?.maxUploadSize || 50} MB</p>
            </div>
            <div class="card">
                <h3>Rental System</h3>
                <p><strong>Default Period:</strong> ${systemSettings.rentalSystem?.defaultRentalPeriod || 30} days</p>
                <p><strong>Security Deposit:</strong> ${systemSettings.rentalSystem?.securityDepositPercentage || 20}%</p>
                <p><strong>Late Fee:</strong> ${systemSettings.rentalSystem?.lateFeePerDay || 100} ETB/day</p>
                <p><strong>Insurance Required:</strong> ${systemSettings.rentalSystem?.requireInsurance ? 'Yes' : 'No'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Feature Status</h2>
        <div class="feature-list">
            <div class="feature-item ${systemSettings.features?.enableVirtualMuseum ? 'enabled' : 'disabled'}">
                Virtual Museum: ${systemSettings.features?.enableVirtualMuseum ? 'Enabled' : 'Disabled'}
            </div>
            <div class="feature-item ${systemSettings.features?.enableRentalSystem ? 'enabled' : 'disabled'}">
                Rental System: ${systemSettings.features?.enableRentalSystem ? 'Enabled' : 'Disabled'}
            </div>
            <div class="feature-item ${systemSettings.features?.enableEducationalContent ? 'enabled' : 'disabled'}">
                Educational Content: ${systemSettings.features?.enableEducationalContent ? 'Enabled' : 'Disabled'}
            </div>
            <div class="feature-item ${systemSettings.features?.enableUserRegistration ? 'enabled' : 'disabled'}">
                User Registration: ${systemSettings.features?.enableUserRegistration ? 'Enabled' : 'Disabled'}
            </div>
            <div class="feature-item ${systemSettings.features?.enablePublicAPI ? 'enabled' : 'disabled'}">
                Public API: ${systemSettings.features?.enablePublicAPI ? 'Enabled' : 'Disabled'}
            </div>
            <div class="feature-item ${systemSettings.features?.enableSocialLogin ? 'enabled' : 'disabled'}">
                Social Login: ${systemSettings.features?.enableSocialLogin ? 'Enabled' : 'Disabled'}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Email Notifications</h2>
        <div class="grid">
            <div class="card">
                <h3>Notification Settings</h3>
                <p>New User Registrations: ${systemSettings.emailNotifications?.newUserRegistrations ? 'Enabled' : 'Disabled'}</p>
                <p>Artifact Approvals: ${systemSettings.emailNotifications?.artifactApprovals ? 'Enabled' : 'Disabled'}</p>
                <p>Rental Activities: ${systemSettings.emailNotifications?.rentalActivities ? 'Enabled' : 'Disabled'}</p>
                <p>Weekly Reports: ${systemSettings.emailNotifications?.weeklyReports ? 'Enabled' : 'Disabled'}</p>
                <p>System Alerts: ${systemSettings.emailNotifications?.systemAlerts ? 'Enabled' : 'Disabled'}</p>
                <p>Security Alerts: ${systemSettings.emailNotifications?.securityAlerts ? 'Enabled' : 'Disabled'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Security Configuration</h2>
        <div class="grid">
            <div class="card">
                <h3>Authentication</h3>
                <p><strong>Session Timeout:</strong> ${systemSettings.security?.sessionTimeout || 30} minutes</p>
                <p><strong>Max Login Attempts:</strong> ${systemSettings.security?.maxLoginAttempts || 5}</p>
                <p><strong>Lockout Duration:</strong> ${systemSettings.security?.lockoutDuration || 15} minutes</p>
                <p><strong>Two-Factor Auth:</strong> ${systemSettings.security?.requireTwoFactor ? 'Required' : 'Optional'}</p>
            </div>
            <div class="card">
                <h3>Password Policy</h3>
                <p><strong>Min Length:</strong> ${systemSettings.security?.passwordPolicy?.minLength || 8} characters</p>
                <p><strong>Uppercase Required:</strong> ${systemSettings.security?.passwordPolicy?.requireUppercase ? 'Yes' : 'No'}</p>
                <p><strong>Numbers Required:</strong> ${systemSettings.security?.passwordPolicy?.requireNumbers ? 'Yes' : 'No'}</p>
                <p><strong>Special Chars Required:</strong> ${systemSettings.security?.passwordPolicy?.requireSpecialChars ? 'Yes' : 'No'}</p>
                <p><strong>Max Age:</strong> ${systemSettings.security?.passwordPolicy?.maxAge || 90} days</p>
            </div>
        </div>
    </div>

    ${statistics ? `
    <div class="section">
        <h2>System Statistics</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${statistics.totalUsers || 0}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${statistics.totalMuseums || 0}</div>
                <div class="stat-label">Museums</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${statistics.totalArtifacts || 0}</div>
                <div class="stat-label">Artifacts</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${statistics.activeRentals || 0}</div>
                <div class="stat-label">Active Rentals</div>
            </div>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated on ${generatedAt.toLocaleString()} | Ethiopian Heritage 360 System Report</p>
        <p>This report contains sensitive system information and should be kept confidential.</p>
    </div>
</body>
</html>`;
  }

  // Generate performance report
  generatePerformanceReport(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.html`;
    const filepath = path.join(this.reportsDir, filename);

    const html = this.generatePerformanceReportHTML(data);

    fs.writeFileSync(filepath, html, 'utf8');

    return {
      filename,
      filepath,
      downloadUrl: `/api/system-settings/reports/download/${filename}`
    };
  }

  generatePerformanceReportHTML(data) {
    const {
      systemHealth = {},
      statistics = {},
      performanceMetrics = {},
      generatedAt = new Date()
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ethiopian Heritage 360 - Performance Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .section {
            background: white;
            margin-bottom: 25px;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #10B981;
            border-bottom: 2px solid #10B981;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10B981;
        }
        .card h3 {
            margin-top: 0;
            color: #059669;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #10B981;
            margin: 10px 0;
        }
        .metric-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
        }
        .status.good {
            background: #d4edda;
            color: #155724;
        }
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        .status.critical {
            background: #f8d7da;
            color: #721c24;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10B981, #059669);
            transition: width 0.3s ease;
        }
        .alert {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid;
        }
        .alert.info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        .alert.warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .alert.critical {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #6c757d;
        }
        @media print {
            body { background-color: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ethiopian Heritage 360</h1>
        <p>Performance Metrics Report - ${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString()}</p>
    </div>

    <div class="section">
        <h2>Server Performance</h2>
        <div class="grid">
            <div class="card">
                <h3>CPU Usage</h3>
                <div class="metric-value">${performanceMetrics.serverHealth?.cpuUsage || 0}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(performanceMetrics.serverHealth?.cpuUsage || 0, 100)}%"></div>
                </div>
                <div class="metric-label">Current CPU utilization</div>
            </div>
            <div class="card">
                <h3>Memory Usage</h3>
                <div class="metric-value">${performanceMetrics.serverHealth?.memoryUsage || 0}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(performanceMetrics.serverHealth?.memoryUsage || 0, 100)}%"></div>
                </div>
                <div class="metric-label">Current memory utilization</div>
            </div>
            <div class="card">
                <h3>Disk Usage</h3>
                <div class="metric-value">${performanceMetrics.serverHealth?.diskUsage || 0}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(performanceMetrics.serverHealth?.diskUsage || 0, 100)}%"></div>
                </div>
                <div class="metric-label">Current disk utilization</div>
            </div>
            <div class="card">
                <h3>Server Uptime</h3>
                <div class="metric-value">${performanceMetrics.serverHealth?.uptime || 0}h</div>
                <div class="metric-label">Hours of continuous operation</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>API Performance</h2>
        <div class="grid">
            <div class="card">
                <h3>Response Time</h3>
                <div class="metric-value">${performanceMetrics.responseTime?.average || 0}ms</div>
                <div class="metric-label">Average response time</div>
                <p>Peak: ${performanceMetrics.responseTime?.peak || 0}ms</p>
                <span class="status ${performanceMetrics.responseTime?.status || 'unknown'}">
                    ${performanceMetrics.responseTime?.status || 'Unknown'}
                </span>
            </div>
            <div class="card">
                <h3>Throughput</h3>
                <div class="metric-value">${performanceMetrics.throughput?.requestsPerDay || 0}</div>
                <div class="metric-label">Requests per day</div>
                <p>Total: ${performanceMetrics.throughput?.totalRequests || 0}</p>
                <p>Trend: ${performanceMetrics.throughput?.trend || 'stable'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>System Health</h2>
        <div class="grid">
            <div class="card">
                <h3>Database Status</h3>
                <span class="status ${systemHealth.database?.status || 'unknown'}">
                    ${systemHealth.database?.status || 'Unknown'}
                </span>
                <p>Last backup: ${systemHealth.database?.lastBackup ? new Date(systemHealth.database.lastBackup).toLocaleString() : 'Not available'}</p>
            </div>
            <div class="card">
                <h3>Maintenance Mode</h3>
                <span class="status ${systemHealth.maintenance?.mode ? 'warning' : 'good'}">
                    ${systemHealth.maintenance?.mode ? 'Active' : 'Normal'}
                </span>
                <p>System is ${systemHealth.maintenance?.mode ? 'under maintenance' : 'operational'}</p>
            </div>
        </div>
    </div>

    ${performanceMetrics.alerts && performanceMetrics.alerts.length > 0 ? `
    <div class="section">
        <h2>Performance Alerts</h2>
        ${performanceMetrics.alerts.map(alert => `
        <div class="alert ${alert.type}">
            <strong>${alert.type.toUpperCase()}:</strong> ${alert.message}
            ${alert.details ? `<br><small>${alert.details}</small>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${statistics ? `
    <div class="section">
        <h2>System Statistics</h2>
        <div class="grid">
            <div class="card">
                <h3>Total Users</h3>
                <div class="metric-value">${statistics.totalUsers || 0}</div>
            </div>
            <div class="card">
                <h3>Total Museums</h3>
                <div class="metric-value">${statistics.totalMuseums || 0}</div>
            </div>
            <div class="card">
                <h3>Total Artifacts</h3>
                <div class="metric-value">${statistics.totalArtifacts || 0}</div>
            </div>
            <div class="card">
                <h3>Active Rentals</h3>
                <div class="metric-value">${statistics.activeRentals || 0}</div>
            </div>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated on ${generatedAt.toLocaleString()} | Ethiopian Heritage 360 Performance Report</p>
        <p>This report contains sensitive performance information and should be kept confidential.</p>
    </div>
</body>
</html>`;
  }

  // Generate performance text report
  generatePerformanceTextReport(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.txt`;
    const filepath = path.join(this.reportsDir, filename);

    const {
      systemHealth = {},
      statistics = {},
      performanceMetrics = {},
      generatedAt = new Date()
    } = data;

    const report = `
ETHIOPIAN HERITAGE 360 - PERFORMANCE REPORT
Generated: ${generatedAt.toLocaleString()}
===============================================

SERVER PERFORMANCE
------------------
CPU Usage: ${performanceMetrics.serverHealth?.cpuUsage || 0}%
Memory Usage: ${performanceMetrics.serverHealth?.memoryUsage || 0}%
Disk Usage: ${performanceMetrics.serverHealth?.diskUsage || 0}%
Server Uptime: ${performanceMetrics.serverHealth?.uptime || 0} hours

API PERFORMANCE
---------------
Average Response Time: ${performanceMetrics.responseTime?.average || 0}ms
Peak Response Time: ${performanceMetrics.responseTime?.peak || 0}ms
Response Status: ${performanceMetrics.responseTime?.status || 'Unknown'}

THROUGHPUT METRICS
------------------
Requests per Day: ${performanceMetrics.throughput?.requestsPerDay || 0}
Total Requests: ${performanceMetrics.throughput?.totalRequests || 0}
Trend: ${performanceMetrics.throughput?.trend || 'stable'}

SYSTEM HEALTH
-------------
Database Status: ${systemHealth.database?.status || 'Unknown'}
Maintenance Mode: ${systemHealth.maintenance?.mode ? 'Active' : 'Normal'}
Last Backup: ${systemHealth.database?.lastBackup ? new Date(systemHealth.database.lastBackup).toLocaleString() : 'Not available'}

${performanceMetrics.alerts && performanceMetrics.alerts.length > 0 ? `
PERFORMANCE ALERTS
------------------
${performanceMetrics.alerts.map(alert => `${alert.type.toUpperCase()}: ${alert.message}${alert.details ? ` - ${alert.details}` : ''}`).join('\n')}
` : ''}

${statistics ? `
SYSTEM STATISTICS
-----------------
Total Users: ${statistics.totalUsers || 0}
Total Museums: ${statistics.totalMuseums || 0}
Total Artifacts: ${statistics.totalArtifacts || 0}
Active Rentals: ${statistics.activeRentals || 0}
` : ''}

===============================================
End of Performance Report
Generated by Ethiopian Heritage 360 System
${generatedAt.toLocaleString()}
`;

    fs.writeFileSync(filepath, report, 'utf8');

    return {
      filename,
      filepath,
      downloadUrl: `/api/system-settings/reports/download/${filename}`
    };
  }

  // Generate a simple text-based report
  generateTextReport(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `system-report-${timestamp}.txt`;
    const filepath = path.join(this.reportsDir, filename);

    const {
      systemSettings = {},
      systemHealth = {},
      statistics = {},
      generatedAt = new Date()
    } = data;

    const report = `
ETHIOPIAN HERITAGE 360 - SYSTEM REPORT
Generated: ${generatedAt.toLocaleString()}
===============================================

SYSTEM HEALTH STATUS
--------------------
Database Status: ${systemHealth.database?.status || 'Unknown'}
Maintenance Mode: ${systemHealth.maintenance?.mode ? 'Active' : 'Normal'}
Active Features: ${Object.values(systemHealth.features || {}).filter(Boolean).length}
Security Level: ${systemHealth.security?.twoFactorRequired ? 'Enhanced' : 'Standard'}

PLATFORM CONFIGURATION
----------------------
Platform Name: ${systemSettings.platform?.name || 'Ethiopian Heritage 360'}
Version: ${systemSettings.platform?.version || '1.0.0'}
Default Language: ${systemSettings.platform?.defaultLanguage || 'English'}
Max Upload Size: ${systemSettings.platform?.maxUploadSize || 50} MB

RENTAL SYSTEM SETTINGS
----------------------
Default Period: ${systemSettings.rentalSystem?.defaultRentalPeriod || 30} days
Security Deposit: ${systemSettings.rentalSystem?.securityDepositPercentage || 20}%
Late Fee: ${systemSettings.rentalSystem?.lateFeePerDay || 100} ETB/day
Insurance Required: ${systemSettings.rentalSystem?.requireInsurance ? 'Yes' : 'No'}

FEATURE STATUS
--------------
Virtual Museum: ${systemSettings.features?.enableVirtualMuseum ? 'Enabled' : 'Disabled'}
Rental System: ${systemSettings.features?.enableRentalSystem ? 'Enabled' : 'Disabled'}
Educational Content: ${systemSettings.features?.enableEducationalContent ? 'Enabled' : 'Disabled'}
User Registration: ${systemSettings.features?.enableUserRegistration ? 'Enabled' : 'Disabled'}
Public API: ${systemSettings.features?.enablePublicAPI ? 'Enabled' : 'Disabled'}
Social Login: ${systemSettings.features?.enableSocialLogin ? 'Enabled' : 'Disabled'}

EMAIL NOTIFICATIONS
-------------------
New User Registrations: ${systemSettings.emailNotifications?.newUserRegistrations ? 'Enabled' : 'Disabled'}
Artifact Approvals: ${systemSettings.emailNotifications?.artifactApprovals ? 'Enabled' : 'Disabled'}
Rental Activities: ${systemSettings.emailNotifications?.rentalActivities ? 'Enabled' : 'Disabled'}
Weekly Reports: ${systemSettings.emailNotifications?.weeklyReports ? 'Enabled' : 'Disabled'}
System Alerts: ${systemSettings.emailNotifications?.systemAlerts ? 'Enabled' : 'Disabled'}
Security Alerts: ${systemSettings.emailNotifications?.securityAlerts ? 'Enabled' : 'Disabled'}

SECURITY CONFIGURATION
----------------------
Session Timeout: ${systemSettings.security?.sessionTimeout || 30} minutes
Max Login Attempts: ${systemSettings.security?.maxLoginAttempts || 5}
Lockout Duration: ${systemSettings.security?.lockoutDuration || 15} minutes
Two-Factor Auth: ${systemSettings.security?.requireTwoFactor ? 'Required' : 'Optional'}

Password Policy:
- Min Length: ${systemSettings.security?.passwordPolicy?.minLength || 8} characters
- Uppercase Required: ${systemSettings.security?.passwordPolicy?.requireUppercase ? 'Yes' : 'No'}
- Numbers Required: ${systemSettings.security?.passwordPolicy?.requireNumbers ? 'Yes' : 'No'}
- Special Chars Required: ${systemSettings.security?.passwordPolicy?.requireSpecialChars ? 'Yes' : 'No'}
- Max Age: ${systemSettings.security?.passwordPolicy?.maxAge || 90} days

${statistics ? `
SYSTEM STATISTICS
-----------------
Total Users: ${statistics.totalUsers || 0}
Total Museums: ${statistics.totalMuseums || 0}
Total Artifacts: ${statistics.totalArtifacts || 0}
Active Rentals: ${statistics.activeRentals || 0}
` : ''}

===============================================
End of Report
Generated by Ethiopian Heritage 360 System
${generatedAt.toLocaleString()}
`;

    fs.writeFileSync(filepath, report, 'utf8');

    return {
      filename,
      filepath,
      downloadUrl: `/api/system-settings/reports/download/${filename}`
    };
  }

  // Clean up old reports (older than 7 days)
  cleanupOldReports() {
    try {
      const files = fs.readdirSync(this.reportsDir);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filepath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filepath);

        if (stats.mtime < sevenDaysAgo) {
          fs.unlinkSync(filepath);
          console.log(`Cleaned up old report: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old reports:', error);
    }
  }
}

module.exports = new PDFGenerator();
