"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = __importDefault(require("../db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let scheduledTask = null;
const LOG_FILE = path_1.default.join(__dirname, '../../server.log');
const log = (msg) => {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(msg);
    try {
        fs_1.default.appendFileSync(LOG_FILE, entry);
    }
    catch (e) { }
};
const startNotificationScheduler = () => {
    const settings = db_1.default.prepare('SELECT notification_frequency_minutes FROM system_settings WHERE id = 1').get();
    const frequency = settings?.notification_frequency_minutes || 5;
    log(`Starting Aggressive Notification Scheduler: Every ${frequency} minutes`);
    if (scheduledTask)
        scheduledTask.stop();
    scheduledTask = node_cron_1.default.schedule(`*/${frequency} * * * *`, () => {
        checkExpiriesAndNotify();
    });
};
exports.startNotificationScheduler = startNotificationScheduler;
const getTransporter = () => {
    const settings = db_1.default.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    if (!settings?.smtp_user || !settings?.smtp_pass)
        return null;
    return nodemailer_1.default.createTransport({
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: false,
        auth: {
            user: settings.smtp_user,
            pass: settings.smtp_pass,
        },
    });
};
const checkExpiriesAndNotify = async () => {
    log('Checking for expiring RPs (Aggressive)...');
    const sysSettings = db_1.default.prepare('SELECT alert_email FROM system_settings WHERE id = 1').get();
    const globalAlertEmail = sysSettings?.alert_email;
    const users = db_1.default.prepare('SELECT * FROM users').all();
    for (const user of users) {
        if (user.is_banned)
            continue;
        const targetEmail = globalAlertEmail || user.email;
        if (!targetEmail) {
            log(`Skipping User ${user.email} (ID: ${user.id}): No target email.`);
            continue;
        }
        // Optional: Check user preference if we want to respect it (but Aggressive means likely force)
        // Ignoring user preference to ensure Alerts go out if Global Email is set.
        const daysLimit = 30;
        SELECT * FROM;
        employees;
        WHERE;
        user_id =  ?
            AND : ;
        notification_enabled = 1;
        AND;
        rp_expiry;
        IS;
        NOT;
        NULL;
        AND;
        rp_expiry != '';
        AND(julianday(rp_expiry) - julianday('now')) <=  ?
            AND(julianday(rp_expiry) - julianday('now')) >= -7 `).all(user.id, daysLimit) as any[];

    if (expiringEmployees.length > 0) {
      log(` : ;
        Found;
        $;
        {
            expiringEmployees.length;
        }
        expiring;
        RPs;
        for (User; $; { user, : .id }.Sending)
            to;
        $;
        {
            targetEmail;
        }
        `);
      await sendEmail(targetEmail, expiringEmployees);
    }
  }
};

export const sendEmail = async (to: string, employees: any[]) => {
  const transporter = getTransporter();

  if (!transporter) {
    log('Skipping email: credentials not set in system_settings');
    return;
  }

  const settings: any = db.prepare('SELECT smtp_user FROM system_settings WHERE id = 1').get();

  const subject = `;
        URGENT;
        ALERT: $;
        {
            employees.length;
        }
        Employee;
        RPs;
        Expiring;
        Soon `;

  const rows = employees.map(e => `
            < tr >
            $;
        {
            e.name;
        }
        /td>
            < td > $;
        {
            e.qid || '-';
        }
        /td>
            < td > $;
        {
            e.rp_expiry;
        }
        /td>
            < td > $;
        {
            e.phone_number || '-';
        }
        /td>
            < /tr> `).join('');

  const html = `
            < h2;
        style = "color: red;" > URGENT;
        RP;
        EXPIRY;
        ALERT < /h2>
            < p > The;
        following;
        employees;
        have;
        RPs;
        expiring;
        within;
        30;
        days.Action;
        is;
        required;
        immediately. < /p>
            < table;
        border = "1";
        cellpadding = "5";
        style = "border-collapse: collapse; width: 100%;" >
            style;
        "background-color: #ffebee;" >
            Name < /th>
            < th > QID < /th>
            < th > Expiry;
        Date < /th>
            < th > Phone < /th>
            < /tr>
            < (/thead>);
        $;
        {
            rows;
        }
        /tbody>
            < /table>
            < p > This;
        is;
        an;
        automated;
        interval;
        alert. < /p> `;

  try {
    await transporter.sendMail({
      from: `;
        "RP Tracker" < $;
        {
            settings.smtp_user;
        }
         > `,
      to,
      subject,
      html,
    });
    log(`;
        Aggressive;
        Email;
        sent;
        to;
        $;
        {
            to;
        }
        `);
  } catch (error: any) {
    log(`;
        Error;
        sending;
        email: $;
        {
            error.message;
        }
        `);
  }
};
        ;
    }
};
