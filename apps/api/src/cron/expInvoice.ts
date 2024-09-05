import prisma from '@/prisma';
import cron from 'node-cron';

const checkAndExpireInvoices = async () => {
  const today = new Date().toISOString().split('T')[0];

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'unpaid',
      due_date: {
        lt: today,
      },
    },
  });

  for (const invoice of overdueInvoices) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'expired',
      },
    });

    console.log(`Invoice ${invoice.id} status updated to expired.`);
  }

  console.log(
    `Processed ${overdueInvoices.length} invoices for expiration check.`,
  );
};

cron.schedule('0 0 * * *', async () => {
  console.log('Running daily invoice expiration check cron job');
  await checkAndExpireInvoices();
});

console.log('Invoice expiration check cron job has been scheduled');
