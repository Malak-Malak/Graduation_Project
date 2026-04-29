using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GP_BackEnd.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;
        private readonly HttpClient _http;

        public EmailService(IConfiguration config, ILogger<EmailService> logger, IHttpClientFactory httpFactory)
        {
            _config = config;
            _logger = logger;
            _http = httpFactory.CreateClient();
        }

        // ── Generate email content via Gemini ────────────────────────────────
        public async Task<(string Subject, string Body)> GenerateReminderEmailAsync(
            string supervisorName,
            string projectName,
            DateTime appointmentDateTime,
            bool isOnline,
            string? meetingLink)
        {
            var geminiKey = _config["Gemini:ApiKey"];
            var dateStr = appointmentDateTime.ToString("dddd, MMMM d yyyy 'at' h:mm tt");

            var prompt = $@"You are a professional academic assistant. Write a short, friendly meeting reminder email for a student group project meeting.

Details:
- Meeting date & time: {dateStr} (UTC)
- Type: {(isOnline ? "Online meeting" : "In-person office hour")}
- Supervisor: {supervisorName}
- Project: {projectName}
{(isOnline && !string.IsNullOrEmpty(meetingLink) ? $"- Meeting link: {meetingLink}" : "")}

Write a concise, professional email (3-4 short paragraphs). Include:
1. First line must be exactly: Subject: <your subject here>
2. A greeting to the team
3. Brief reminder of the meeting details
4. {(isOnline ? "Remind them to join via the link on time" : "Remind them to be at the office on time")}
5. Polite closing

Respond with ONLY the email text. Start with 'Subject: ' on the first line.";

            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={geminiKey}";
                var payload = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    }
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(url, content);
                var responseStr = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseStr);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? "";

                var lines = text.Split('\n');
                var subjectLine = lines.FirstOrDefault(l => l.TrimStart().StartsWith("Subject:", StringComparison.OrdinalIgnoreCase)) ?? "";
                var subject = subjectLine.Replace("Subject:", "", StringComparison.OrdinalIgnoreCase).Trim();
                var body = string.Join("\n", lines.Where(l => !l.TrimStart().StartsWith("Subject:", StringComparison.OrdinalIgnoreCase))).Trim();

                return (subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Gemini failed, using fallback email. Error: {Error}", ex.Message);
                // Fallback if Gemini fails
                return (
                    $"Meeting Reminder – {dateStr}",
                    $"Hi team,\n\nThis is a reminder that you have a meeting with {supervisorName} scheduled on {dateStr}.\n" +
                    (isOnline && !string.IsNullOrEmpty(meetingLink) ? $"\nJoin here: {meetingLink}\n" : "") +
                    "\nPlease come prepared with your latest updates.\n\nBest regards,\nGPMS System"
                );
            }
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