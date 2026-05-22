using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GP_BackEnd.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ── Reminder email for team members ──────────────────────────────────
        public (string Subject, string Body) GenerateReminderEmail(
            string supervisorName,
            string projectName,
            DateTime appointmentDateTime,
            bool isOnline,
            string? meetingLink)
        {
            var dateStr = appointmentDateTime.ToString("dddd, MMMM d yyyy 'at' h:mm tt");

            var subject = $"Appointment Reminder – {dateStr} (UTC)";

            var body = $"Hi team,\n\n" +
                       $"This is a reminder that you have an upcoming appointment with {supervisorName} " +
                       $"regarding your project \"{projectName}\".\n\n" +
                       $"Date & Time : {dateStr} (UTC)\n" +
                       $"Type        : {(isOnline ? "Online Meeting" : "In-Person Office Hour")}\n";

            if (isOnline && !string.IsNullOrEmpty(meetingLink))
                body += $"Meeting Link: {meetingLink}\n";

            body += isOnline
                ? "\nPlease make sure to join the meeting on time and come prepared with your latest updates."
                : "\nPlease make sure to be at the office on time and come prepared with your latest updates.";

            body += "\n\nBest regards,\nGPMS System";

            return (subject, body);
        }

        // ── Reminder email for supervisor ─────────────────────────────────────
        public (string Subject, string Body) GenerateSupervisorReminderEmail(
            string supervisorName,
            string teamName,
            DateTime appointmentDateTime,
            bool isOnline,
            string? meetingLink)
        {
            var dateStr = appointmentDateTime.ToString("dddd, MMMM d yyyy 'at' h:mm tt");

            var subject = $"Appointment Reminder – {teamName} – {dateStr} (UTC)";

            var body = $"Dear {supervisorName},\n\n" +
                       $"This is a reminder that you have an upcoming appointment with the team working on \"{teamName}\".\n\n" +
                       $"Date & Time : {dateStr} (UTC)\n" +
                       $"Type        : {(isOnline ? "Online Meeting" : "In-Person Office Hour")}\n";

            if (isOnline && !string.IsNullOrEmpty(meetingLink))
                body += $"Meeting Link: {meetingLink}\n";

            body += "\n\nBest regards,\nGPMS System";

            return (subject, body);
        }

        // ── Send email via SMTP ───────────────────────────────────────────────
        public async Task SendEmailAsync(IEnumerable<string> toAddresses, string subject, string body)
        {
            var smtpHost = _config["Email:SmtpHost"];
            var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
            var smtpUser = _config["Email:Username"];
            var smtpPass = _config["Email:Password"];
            var fromName = _config["Email:FromName"] ?? "GPMS System";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPass)
            };

            var validRecipients = toAddresses.Where(e => !string.IsNullOrWhiteSpace(e)).ToList();
            if (!validRecipients.Any())
            {
                _logger.LogWarning("SendEmailAsync: no valid recipients, skipping.");
                return;
            }

            var mail = new MailMessage
            {
                From = new MailAddress(smtpUser!, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = false,
            };

            foreach (var addr in validRecipients)
                mail.To.Add(addr);

            await client.SendMailAsync(mail);
            _logger.LogInformation("Email sent to {Count} recipients: {Subject}", validRecipients.Count, subject);
        }
    }
}