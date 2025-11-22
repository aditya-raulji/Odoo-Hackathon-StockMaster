import bcrypt from 'bcryptjs';
import prisma from './src/prisma/prisma.js';

async function createStockmaster() {
  try {
    const email = 'stockmaster@example.com';
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`User ${email} already exists`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('StockMaster@123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        firstName: 'Stock',
        lastName: 'Master',
        passwordHash,
        role: 'STOCKMASTER',
      },
    });

    console.log(`✅ STOCKMASTER user created: ${user.email}`);
    console.log(`   Password: StockMaster@123`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createStockmaster();
