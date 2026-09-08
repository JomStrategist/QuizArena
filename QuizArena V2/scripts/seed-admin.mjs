import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://teamthestrategist_db_user:YI5d7kXZ16ImHOJe@thestrategist.ix3misa.mongodb.net/quizarena?retryWrites=true&w=majority&appName=TheStrategist';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['TRAINER', 'STUDENT', 'ADMIN'], default: 'TRAINER' },
    avatarUrl: { type: String },
    organization: { type: String, default: 'KVJ Analytics' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const adminEmail = 'mail@thestrategist.co.in';
    const adminPassword = 'AjayThomas@1';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.passwordHash = hashedPassword;
      existingAdmin.role = 'TRAINER';
      existingAdmin.name = 'Admin';
      await existingAdmin.save();
      console.log(`Updated existing Admin user: ${adminEmail} in DB.`);
    } else {
      await User.create({
        email: adminEmail,
        name: 'Admin',
        role: 'TRAINER',
        passwordHash: hashedPassword,
        organization: 'KVJ Analytics',
      });
      console.log(`Created new Admin user: ${adminEmail} in DB.`);
    }

    console.log('Admin user seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
