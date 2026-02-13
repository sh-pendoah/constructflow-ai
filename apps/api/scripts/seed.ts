import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/worklighter?authSource=admin';

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // 1. Ensure Demo Tenant
    let tenant = await Tenant.findOne({ name: 'Demo Tenant' });
    if (!tenant) {
      console.log('Creating Demo Tenant...');
      tenant = await Tenant.create({
        name: 'Demo Tenant',
        settings: {
          invoiceThresholds: { pmAutoApproveLimit: 5000, ownerApprovalLimit: 25000 },
          approvalRouting: {},
          alertPreferences: { complianceAlerts: true, expirationDays: [30, 15, 7, 0] }
        },
        isActive: true
      });
      console.log('Demo Tenant created.');
    } else {
      console.log('Demo Tenant already exists.');
    }

    // 2. Ensure Admin User
    const adminEmail = 'demo@worklight.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log('Creating Admin User...');
      admin = await User.create({
        email: adminEmail,
        password: 'password123', // Will be hashed by pre-save hook
        name: 'Demo Admin',
        role: 'ADMIN',
        tenantId: tenant._id,
        isActive: true,
        company: 'Demo Corp'
      });
      console.log('Admin User created.');
    } else {
      console.log('Admin User already exists.');
      // Optionally update tenant if missing
      if (!admin.tenantId) {
        admin.tenantId = tenant._id as mongoose.Types.ObjectId;
        await admin.save();
        console.log('Admin User linked to Demo Tenant.');
      }
    }

    console.log('------------------------------------------------');
    console.log('Seeding Complete.');
    console.log('User: ' + adminEmail);
    console.log('Pass: password123');
    console.log('------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
