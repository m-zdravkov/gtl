import { ErrorHandler } from '../ErrorHandler';

const nodemailer = require('nodemailer');
import { config} from '../config';
import { Logger } from '../logger/Logger';

export async function sendMail(
  sendTo: string, emailContent: string, emailSubject: string): Promise<void> {
  const fName = 'Mail.sendMail';
  if (config.smtp.name && config.smtp.host && config.smtp.port && config.smtp.auth.user &&
      config.smtp.auth.pass && config.smtp.sendEmail) {
    // Create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      name: config.smtp.name,
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port && config.smtp.port === 465,
      auth: {
        user: config.smtp.auth.user,
        pass: config.smtp.auth.pass
      },
      tls: {
        rejectUnauthorized: true
      }
    });

    try {
      await transporter.sendMail({
        from: '<' + config.smtp.auth.email + '>', // Sender address
        to: sendTo, // List of receivers
        subject: emailSubject, // Subject line
        text: emailContent // Plain text body
        // If we need html use: html: '<b>Hello world?</b>' // Html body
      });
    } catch (e) {
      throw ErrorHandler.handleErrExternal(fName, 'There was an error sending email');
    }
  } else {
    new Logger().logMsg(`Emails are disabled`);
    new Logger().logMsg(`Send to: ${sendTo}`);
    new Logger().logMsg(`Subject: ${emailSubject}`);
    new Logger().logMsg(`Content: ${emailContent}`);
  }
}
