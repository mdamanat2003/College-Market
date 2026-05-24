import bcrypt from 'bcryptjs';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Notification from '../models/Notification';

export const seedTransactions = async () => {
  try {
    const existing = await Order.countDocuments({ status: { $in: ['Completed', 'Cancelled'] } });
    if (existing > 0) {
      console.log('⟳ Past transactions already exist, skipping seed.');
      return;
    }

    // Create test seller and buyer (use updateOne with hashed password to avoid double-hash hooks)
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('test1234', salt);

    await User.updateOne(
      { email: 'testseller@campuscart.com' },
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
      { email: 'testbuyer@campuscart.com' },
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

    const seller = await User.findOne({ email: 'testseller@campuscart.com' });
    const buyer = await User.findOne({ email: 'testbuyer@campuscart.com' });

    if (!seller || !buyer) {
      console.warn('Seed users not found after upsert, aborting transaction seed');
      return;
    }

    // Create a product by seller
    await Product.updateOne(
      { title: 'Seeded Textbook - Data Structures' },
      {
        $set: {
          seller: seller._id,
          description: 'Used textbook for Data Structures, good condition',
          price: 499,
          category: 'Books',
          images: [],
          condition: 'Good',
          status: 'Sold',
          college: 'Demo College'
        }
      },
      { upsert: true }
    );

    const product = await Product.findOne({ title: 'Seeded Textbook - Data Structures' });
    if (!product) {
      console.warn('Seed product not found, aborting');
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
      const admin = await User.findOne({ email: 'admin@campuscart.com' });
      if (admin) {
        const notifBatch: any[] = [];
        for (const ord of created) {
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

    console.log('✅ Seeded past transactions and test users');
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
  }
};

export default seedTransactions;
