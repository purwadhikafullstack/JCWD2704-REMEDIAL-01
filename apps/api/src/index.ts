import App from './app';
import './cron/expInvoice';
import './cron/sendInvoice';

const main = () => {
  // init db here

  const app = new App();
  app.start();
};

main();
