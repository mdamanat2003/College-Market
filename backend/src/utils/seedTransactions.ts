import bcrypt from 'bcryptjs';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Notification from '../models/Notification';
import LostFound from '../models/LostFound';
import Event from '../models/Event';

export const seedTransactions = async () => {
  try {
    // 1. Setup Users
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('test1234', salt);
    // ... rest of the code

    await User.updateOne(
      { email: 'testseller@ooplabdh.com' },
      {
        $set: {
          name: 'Test Seller',
          password: hashed,
          phone: '9999990001',
          college: 'Demo College',
          role: 'student'
        }
      },
      { upsert: true }
    );

    await User.updateOne(
      { email: 'testbuyer@ooplabdh.com' },
      {
        $set: {
          name: 'Test Buyer',
          password: hashed,
          phone: '9999990002',
          college: 'Demo College',
          role: 'student'
        }
      },
      { upsert: true }
    );

    const seller = await User.findOne({ email: 'testseller@ooplabdh.com' });
    const buyer = await User.findOne({ email: 'testbuyer@ooplabdh.com' });

    if (!seller || !buyer) {
      console.warn('Seed users not found after upsert, aborting transaction seed');
      return;
    }

    // Create multiple products with different statuses
    const productsToSeed = [
      {
        title: 'Seeded Textbook - Data Structures',
        description: 'Used textbook for Data Structures, good condition',
        price: 499,
        category: 'Books',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop'],
        condition: 'Good',
        status: 'Sold',
        college: 'Demo College'
      },
      {
        title: 'Engineering Mathematics Vol 1',
        description: 'Perfect for first-year engineering students.',
        price: 350,
        category: 'Books',
        images: ['https://images.unsplash.com/photo-1532012197367-e3381e61f25b?q=80&w=1000&auto=format&fit=crop'],
        condition: 'Like New',
        status: 'Available',
        college: 'Demo College'
      },
      {
        title: 'Wireless Mouse',
        description: 'Logitech wireless mouse, 6 months used.',
        price: 600,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop'],
        condition: 'Good',
        status: 'Available',
        college: 'Demo College'
      },
      {
        title: 'Study Lamp',
        description: 'LED study lamp with adjustable brightness.',
        price: 450,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1000&auto=format&fit=crop'],
        condition: 'New',
        status: 'Available',
        college: 'Demo College'
      }
    ];

    for (const pData of productsToSeed) {
      await Product.updateOne(
        { title: pData.title },
        {
          $set: {
            ...pData,
            seller: seller._id,
          }
        },
        { upsert: true }
      );
    }

    const product = await Product.findOne({ title: 'Seeded Textbook - Data Structures' });
    if (!product) {
      console.warn('Seed product not found, aborting');
      return;
    }

    const existingOrders = await Order.countDocuments({ status: { $in: ['Completed', 'Cancelled'] } });
    if (existingOrders > 0) {
      console.log('⟳ Past transactions already exist, skipping order seed.');
      return;
    }

    // Create two sample orders: one Completed and one Cancelled
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); // 30 days ago

    const created = await Order.create([
      {
        buyer: buyer._id,
        seller: seller._id,
        product: product._id,
        amount: product.price,
        paymentMode: 'Escrow',
        paymentStatus: 'Released',
        deliveryStatus: 'Received',
        status: 'Completed',
        razorpayOrderId: `seed_rzp_${Date.now()}_1`,
        razorpayPaymentId: `seed_rzp_pay_${Date.now()}_1`,
        createdAt: pastDate,
        updatedAt: pastDate,
      },
      {
        buyer: buyer._id,
        seller: seller._id,
        product: product._id,
        amount: product.price,
        paymentMode: 'Escrow',
        paymentStatus: 'Refunded',
        deliveryStatus: 'Cancelled',
        status: 'Cancelled',
        razorpayOrderId: `seed_rzp_${Date.now()}_2`,
        razorpayPaymentId: `seed_rzp_pay_${Date.now()}_2`,
        createdAt: new Date(pastDate.getTime() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(pastDate.getTime() - 1000 * 60 * 60 * 24),
      }
    ] as any);

    // Create notifications for admin and participants so admin UI shows history
    try {
      const admin = await User.findOne({ email: 'admin@ooplabdh.com' });
      if (admin) {
        const createdOrders = Array.isArray(created) ? created : [created];
        const notifBatch: any[] = [];
        for (const ord of createdOrders) {
          // Admin notification about order status
          notifBatch.push({
            recipient: admin._id,
            type: 'Order',
            title: ord.status === 'Completed' ? 'Order completed' : 'Order cancelled',
            message: `Order #${String(ord._id).slice(-6).toUpperCase()} is ${ord.status}.`,
            relatedId: ord._id,
          });

          // Buyer & Seller notifications
          notifBatch.push({
            recipient: ord.buyer,
            type: 'Order',
            title: ord.status === 'Completed' ? 'Payment released' : 'Refund processed',
            message: ord.status === 'Completed' ? 'Admin released escrow funds.' : 'Admin approved refund for your order.',
            relatedId: ord._id,
          });

          notifBatch.push({
            recipient: ord.seller,
            type: 'Order',
            title: ord.status === 'Completed' ? 'You received payment' : 'Order refunded',
            message: ord.status === 'Completed' ? 'Escrow funds released to your account.' : 'Order was refunded to the buyer.',
            relatedId: ord._id,
          });
        }

        await Notification.insertMany(notifBatch);
      }
    } catch (err) {
      console.error('Failed to create seed notifications:', err);
    }

    // Lost & Found Seed
    const existingLostFound = await LostFound.countDocuments();
    if (existingLostFound === 0) {
      await LostFound.create([
        {
          reporter: seller._id,
          title: 'Found Blue Water Bottle',
          description: 'Found a blue Milton water bottle near the sports ground. It has a slight dent on the bottom.',
          type: 'Found',
          category: 'Others',
          location: 'Sports Ground',
          date: new Date(),
          status: 'Active'
        },
        {
          reporter: buyer._id,
          title: 'Lost ID Card',
          description: 'Lost my ID card (CSE branch). It was in a black holder.',
          type: 'Lost',
          category: 'Documents',
          location: 'Main Canteen',
          date: new Date(),
          status: 'Active'
        }
      ]);
      console.log('✅ Seeded Lost & Found items');
    }

    // Campus Events Seed
    const existingEvents = await Event.countDocuments();
    if (existingEvents === 0) {
      const futureDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
      const futureDate2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days from now

      await Event.create([
        {
          title: 'TechX 2026 - Hackathon',
          description: 'The biggest 24-hour annual hackathon of the year. Exciting prizes, networking, and free food!',
          organizer: 'Coding Club',
          date: futureDate1,
          location: 'Main Auditorium',
          category: 'Technical',
          registrationLink: 'https://example.com/register/techx',
          createdBy: seller._id,
        },
        {
          title: 'Cultural Night: Diwali Fest',
          description: 'Join us for an evening of dance, music, and celebration. Ethnic wear is mandatory.',
          organizer: 'Cultural Committee',
          date: futureDate2,
          location: 'Open Air Theatre',
          category: 'Cultural',
          createdBy: buyer._id,
        }
      ]);
      console.log('✅ Seeded Campus Fest Events');
    }

    console.log('✅ Seeded past transactions and test users');
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
  }
};

export default seedTransactions;
