import bcrypt from "bcryptjs";
import User from "../models/User";

export const seedAdmin = async () => {
  try {
    // 1. Pehle purane kharaab admin ko delete karo (agar koi error state me bana ho)
    await User.deleteOne({ email: 'admin@ooplabdh.com' });
    
    // 2. Password ko yahan strictly 1 baar hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 3. updateOne use karke directly DB me daalo (Ye User.create() ke double-hash hook ko bypass karega)
    await User.updateOne(
      { email: 'admin@ooplabdh.com' },
      {
        $set: {
          name: 'Super Admin',
          username: 'super_admin',
          password: hashedPassword,
          role: 'admin',
          college: 'Admin HQ',
          phone: '0000000000'
        }
      },
      { upsert: true } // Agar account nahi hai toh create kar dega
    );
    
    console.log('✅ Admin account seeded successfully (Double Hash Bypass)!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};