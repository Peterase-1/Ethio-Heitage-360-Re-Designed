import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Lock,
  Globe,
  Clock,
  Palette,
  Mail,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Key
} from 'lucide-react';
import settingsService from '../../services/settingsService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from 'sonner';

const MuseumSettings = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  // Settings data
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      eventReminders: true,
      staffUpdates: true,
      systemAlerts: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: []
    },
    general: {
      language: 'en',
      timezone: 'Africa/Addis_Ababa',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    },
    museum: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      analyticsEnabled: true,
      publicProfile: true
    }
  });

  // Dialog states
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [ipDialog, setIpDialog] = useState(false);
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [newIp, setNewIp] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings('general', settings.general);
      await settingsService.updateSettings('notifications', settings.notifications);
      await settingsService.updateSettings('security', settings.security);
      await settingsService.updateSettings('museum', settings.museum);

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    try {
      if (newPassword.new !== newPassword.confirm) {
        toast.error('New passwords do not match');
        return;
      }

      await settingsService.changePassword(
        newPassword.current,
        newPassword.new
      );

      setPasswordDialog(false);
      setNewPassword({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const addIpAddress = async () => {
    try {
      if (newIp && !settings.security.ipWhitelist.find(item => item.ip === newIp)) {
        await settingsService.addToWhitelist(newIp, '');

        // Update local state
        const updatedWhitelist = [...settings.security.ipWhitelist, { ip: newIp, description: '', addedAt: new Date() }];
        handleSettingChange('security', 'ipWhitelist', updatedWhitelist);

        setNewIp('');
        setIpDialog(false);
        toast.success('IP address added successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add IP address');
    }
  };

  const removeIpAddress = async (ip) => {
    try {
      await settingsService.removeFromWhitelist(ip);

      // Update local state
      handleSettingChange('security', 'ipWhitelist',
        settings.security.ipWhitelist.filter(item => item.ip !== ip)
      );
      toast.success('IP address removed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to remove IP address');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <MuseumAdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MuseumAdminSidebar />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center mb-2">
              <Settings className="mr-3 h-8 w-8 text-primary" />
              Museum Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Configure your museum dashboard preferences, security, and system settings
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={loadSettings}
              className="text-primary hover:text-primary-foreground hover:bg-primary"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> General
              </TabsTrigger>
              <TabsTrigger value="museum" className="flex items-center gap-2">
                <Database className="h-4 w-4" /> Museum
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="flex items-center mb-6">
                <Bell className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Mail className="h-4 w-4 text-primary mr-2" />
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notif">Enable email notifications</Label>
                        <Switch
                          id="email-notif"
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="event-notif">Event reminders</Label>
                        <Switch
                          id="event-notif"
                          checked={settings.notifications.eventReminders}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'eventReminders', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Smartphone className="h-4 w-4 text-primary mr-2" />
                      Mobile Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notif">SMS alerts</Label>
                        <Switch
                          id="sms-notif"
                          checked={settings.notifications.sms}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notif">Push notifications</Label>
                        <Switch
                          id="push-notif"
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Monitor className="h-4 w-4 text-primary mr-2" />
                      System Notifications
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="staff-notif">Staff updates</Label>
                        <Switch
                          id="staff-notif"
                          checked={settings.notifications.staffUpdates}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'staffUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-notif">System alerts</Label>
                        <Switch
                          id="system-notif"
                          checked={settings.notifications.systemAlerts}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'systemAlerts', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="flex items-center mb-6">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Security Settings</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Lock className="h-4 w-4 text-primary mr-2" />
                      Authentication
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="2fa">Two-factor authentication</Label>
                        <Switch
                          id="2fa"
                          checked={settings.security.twoFactor}
                          onCheckedChange={(checked) => handleSettingChange('security', 'twoFactor', checked)}
                        />
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setPasswordDialog(true)}>
                        <Key className="mr-2 h-4 w-4" /> Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      Session Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                        <Input
                          id="passwordExpiry"
                          type="number"
                          value={settings.security.passwordExpiry}
                          onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                        <Input
                          id="loginAttempts"
                          type="number"
                          value={settings.security.loginAttempts}
                          onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold flex items-center">
                        <Monitor className="h-4 w-4 text-primary mr-2" />
                        IP Whitelist
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => setIpDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add IP
                      </Button>
                    </div>

                    {settings.security.ipWhitelist.length > 0 ? (
                      <div className="space-y-2">
                        {settings.security.ipWhitelist.map((ipItem, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <div className="flex items-center">
                              <Monitor className="h-4 w-4 text-primary mr-3" />
                              <span className="text-sm font-medium">{ipItem.ip || ipItem}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeIpAddress(ipItem.ip || ipItem)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No IP addresses whitelisted
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="flex items-center mb-6">
                <Globe className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">General Settings</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Globe className="h-4 w-4 text-primary mr-2" />
                      Localization
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={settings.general.language}
                          onValueChange={(value) => handleSettingChange('general', 'language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="am">Amharic</SelectItem>
                            <SelectItem value="or">Oromo</SelectItem>
                            <SelectItem value="ti">Tigrinya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select
                          value={settings.general.timezone}
                          onValueChange={(value) => handleSettingChange('general', 'timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Addis_Ababa">Africa/Addis Ababa</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="America/New_York">America/New York</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={settings.general.currency}
                          onValueChange={(value) => handleSettingChange('general', 'currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="ETB">ETB</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Palette className="h-4 w-4 text-primary mr-2" />
                      Appearance
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select
                          value={settings.general.theme}
                          onValueChange={(value) => handleSettingChange('general', 'theme', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date Format</Label>
                        <Select
                          value={settings.general.dateFormat}
                          onValueChange={(value) => handleSettingChange('general', 'dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Date Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Museum Tab */}
            <TabsContent value="museum" className="space-y-6">
              <div className="flex items-center mb-6">
                <Database className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Museum System Settings</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Database className="h-4 w-4 text-primary mr-2" />
                      Data Management
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoBackup">Automatic backup</Label>
                        <Switch
                          id="autoBackup"
                          checked={settings.museum.autoBackup}
                          onCheckedChange={(checked) => handleSettingChange('museum', 'autoBackup', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Backup Frequency</Label>
                        <Select
                          value={settings.museum.backupFrequency}
                          onValueChange={(value) => handleSettingChange('museum', 'backupFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataRetention">Data Retention (days)</Label>
                        <Input
                          id="dataRetention"
                          type="number"
                          value={settings.museum.dataRetention}
                          onChange={(e) => handleSettingChange('museum', 'dataRetention', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Monitor className="h-4 w-4 text-primary mr-2" />
                      Public Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="analyticsEnabled">Enable Analytics</Label>
                        <Switch
                          id="analyticsEnabled"
                          checked={settings.museum.analyticsEnabled}
                          onCheckedChange={(checked) => handleSettingChange('museum', 'analyticsEnabled', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="publicProfile">Public Profile</Label>
                        <Switch
                          id="publicProfile"
                          checked={settings.museum.publicProfile}
                          onCheckedChange={(checked) => handleSettingChange('museum', 'publicProfile', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={newPassword.current}
                onChange={(e) => setNewPassword({ ...newPassword, current: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword.new}
                onChange={(e) => setNewPassword({ ...newPassword, new: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={newPassword.confirm}
                onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP Dialog */}
      <Dialog open={ipDialog} onOpenChange={setIpDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add IP to Whitelist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-ip">IP Address</Label>
              <Input
                id="new-ip"
                placeholder="e.g. 192.168.1.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIpDialog(false)}>Cancel</Button>
            <Button onClick={addIpAddress}>Add IP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default MuseumSettings;