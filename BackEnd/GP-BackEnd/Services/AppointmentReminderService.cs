using GP_BackEnd.Data;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GP_BackEnd.Services
{
    /// <summary>
    /// Runs daily at 08:00 UTC.
    /// Finds every Approved appointment whose DateTime is between 47h and 49h from now
    /// (i.e. roughly 2 days away) and sends an email reminder to all team members.
    /// Uses a ReminderSentAt flag on the appointment to avoid duplicate sends.
    /// </summary>
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentReminderService> _logger;

        // Run once per day; first run waits until next 08:00 UTC
        private static TimeSpan TimeUntilNextRun()
        {
            var now = DateTime.UtcNow;
            var next = now.Date.AddHours(8);
            if (next <= now) next = next.AddDays(1);
            return next - now;
        }

        public AppointmentReminderService(
            IServiceScopeFactory scopeFactory,
            ILogger<AppointmentReminderService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AppointmentReminderService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = TimeUntilNextRun();
                _logger.LogInformation("Next reminder check in {Hours}h {Minutes}m", (int)delay.TotalHours, delay.Minutes);
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                await RunReminderCheckAsync(stoppingToken);
            }
        }

        private async Task RunReminderCheckAsync(CancellationToken ct)
        {
            _logger.LogInformation("Running appointment reminder check at {Time}", DateTime.UtcNow);

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            var now = DateTime.UtcNow;
            var windowStart = now.AddHours(47);   // ~2 days - 1h buffer
            var windowEnd   = now.AddHours(49);   // ~2 days + 1h buffer

            // Get Approved appointments in the 2-day window that haven't been reminded yet
            var upcoming = await db.Appointments
                .Include(a => a.Team)
                    .ThenInclude(t => t.TeamMembers)
                        .ThenInclude(tm => tm.User)
                            .ThenInclude(u => u.UserProfile)
                .Include(a => a.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Where(a =>
                    a.Status == "Approved" &&
                    a.DateTime >= windowStart &&
                    a.DateTime <= windowEnd &&
                    a.ReminderSentAt == null)
                .ToListAsync(ct);

            _logger.LogInformation("Found {Count} appointments to remind.", upcoming.Count);

            foreach (var appt in upcoming)
            {
                try
                {
                    var supervisorName = appt.Supervisor?.UserProfile?.FullName
                                         ?? appt.Supervisor?.Username
                                         ?? "Your supervisor";

                    var projectName = appt.Team?.ProjectTitle ?? "your project";

                    // Collect personal emails of all team members
                    var emails = appt.Team.TeamMembers
                        .Select(tm => tm.User?.UserProfile?.PersonalEmail)
                        .Where(e => !string.IsNullOrWhiteSpace(e))
                        .Distinct()
                        .ToList();

                    if (!emails.Any())
                    {
                        _logger.LogWarning("Appointment {Id}: no emails found for team {TeamId}, skipping.", appt.Id, appt.TeamId);
                        continue;
                    }

                    // Generate content via Gemini
                    var (subject, body) = await emailService.GenerateReminderEmailAsync(
                        supervisorName,
                        projectName,
                        appt.DateTime,
                        appt.IsOnline ?? false,
                        appt.Link);

                    // Send
                    await emailService.SendEmailAsync(emails!, subject, body);

                    // Mark as reminded so we don't send again
                    appt.ReminderSentAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);

                    _logger.LogInformation(
                        "Reminder sent for appointment {Id} (team {TeamId}) to {Count} members.",
                        appt.Id, appt.TeamId, emails.Count);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send reminder for appointment {Id}.", appt.Id);
                }
            }
        }
    }
}