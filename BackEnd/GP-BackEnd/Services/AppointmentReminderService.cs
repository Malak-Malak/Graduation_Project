using GP_BackEnd.Data;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GP_BackEnd.Services
{
    /// <summary>
    /// Runs every 2 minutes (testing mode).
    /// Finds every Approved appointment within the next 24 hours
    /// and sends a reminder email to all team members and the supervisor.
    /// Uses ReminderSentAt to avoid sending the same reminder twice.
    ///
    /// TO SWITCH TO PRODUCTION: replace Task.Delay(TimeSpan.FromMinutes(2))
    /// with Task.Delay(TimeUntilNextRun()) to run once daily at 08:00 UTC.
    /// </summary>
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentReminderService> _logger;

        // Returns how long to wait until next 08:00 UTC — use this in production
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
                await RunReminderCheckAsync(stoppingToken);

                // TESTING: runs every 2 minutes
                await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

                // PRODUCTION: uncomment the lines below and remove the 2 lines above
                // var delay = TimeUntilNextRun();
                // _logger.LogInformation("Next reminder check in {Hours}h {Minutes}m", (int)delay.TotalHours, delay.Minutes);
                // await Task.Delay(delay, stoppingToken);
            }
        }

        private async Task RunReminderCheckAsync(CancellationToken ct)
        {
            _logger.LogInformation("Running appointment reminder check at {Time}", DateTime.UtcNow);

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            var now = DateTime.UtcNow;
            var windowStart = now;
            var windowEnd = now.AddHours(24);

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

                    var teamName = appt.Team?.ProjectTitle ?? "your project";

                    // ?? Email team members ????????????????????????????????????
                    var memberEmails = appt.Team.TeamMembers
                        .Select(tm => tm.User?.UserProfile?.PersonalEmail)
                        .Where(e => !string.IsNullOrWhiteSpace(e))
                        .Distinct()
                        .ToList();

                    if (memberEmails.Any())
                    {
                        var (memberSubject, memberBody) = emailService.GenerateReminderEmail(
                            supervisorName,
                            teamName,
                            appt.DateTime,
                            appt.IsOnline ?? false,
                            appt.Link);

                        await emailService.SendEmailAsync(memberEmails!, memberSubject, memberBody);

                        _logger.LogInformation(
                            "Member reminder sent for appointment {Id} to {Count} members.",
                            appt.Id, memberEmails.Count);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Appointment {Id}: no personal emails found for team members, skipping member email.",
                            appt.Id);
                    }

                    // ?? Email supervisor ??????????????????????????????????????
                    var supervisorEmail = appt.Supervisor?.UserProfile?.PersonalEmail;

                    if (!string.IsNullOrWhiteSpace(supervisorEmail))
                    {
                        var (supSubject, supBody) = emailService.GenerateSupervisorReminderEmail(
                            supervisorName,
                            teamName,
                            appt.DateTime,
                            appt.IsOnline ?? false,
                            appt.Link);

                        await emailService.SendEmailAsync(new[] { supervisorEmail }, supSubject, supBody);

                        _logger.LogInformation(
                            "Supervisor reminder sent for appointment {Id} to {SupervisorEmail}.",
                            appt.Id, supervisorEmail);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Appointment {Id}: no personal email found for supervisor, skipping supervisor email.",
                            appt.Id);
                    }

                    // ?? Mark as reminded ??????????????????????????????????????
                    appt.ReminderSentAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send reminder for appointment {Id}.", appt.Id);
                }
            }
        }
    }
}