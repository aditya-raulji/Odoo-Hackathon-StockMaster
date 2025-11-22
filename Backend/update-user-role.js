import prisma from './src/prisma/prisma.js';

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: 'yasark8850@gmail.com' },
      data: { role: 'INVENTORY_MANAGER' },
    });
    console.log(`✅ User role updated to INVENTORY_MANAGER:`, user.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    process.exit(1);
  }
}

updateUserRole();
