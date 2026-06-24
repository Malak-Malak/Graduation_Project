using GP_BackEnd.Data;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.Text.Json;

namespace GP_BackEnd.Services
{
    public class TaskNotificationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly HttpClient _httpClient;
        private readonly string? _openAiApiKey;

        public TaskNotificationService(IServiceScopeFactory scopeFactory, IConfiguration config)
        {
            _scopeFactory = scopeFactory;
            _httpClient = new HttpClient();
            _openAiApiKey = config["OpenAI:ApiKey"];
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await CheckAndNotifyAsync();

                // Run every 30
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task CheckAndNotifyAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<NotificationService>(); // 👈 use existing service

            var now = DateTime.UtcNow;

            var tasks = await context.TaskItems
                .Include(t => t.Assignments)
                .Where(t =>
                    t.Status != "Done" &&
                    
                    (
                        (t.Deadline <= now.AddHours(24) && t.Deadline > now && !t.Notified24h) ||
                        (t.Deadline <= now.AddHours(48) && t.Deadline > now.AddHours(24) && !t.Notified48h)
                    )
                )
                .ToListAsync();

            foreach (var task in tasks)
            {
                bool is24h = task.Deadline <= now.AddHours(24);
                string timeLeft = is24h ? "24 hours" : "48 hours";

                // Generate smart message using OpenAI
                var message = await GenerateNotificationMessageAsync(task.Title, timeLeft);

                // Use existing NotificationService to save for each assigned member
                foreach (var assignment in task.Assignments)
                {
                    context.Notifications.Add(new Notification
                    {
                        Title = $"Task Due in {timeLeft}",
                        Message = message,
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false,
                        UserId = assignment.UserId
                    });
                }

                // Mark as notified to prevent duplicate notifications
                if (is24h)
                    task.Notified24h = true;
                else
                    task.Notified48h = true;
            }

            // Check for overdue tasks (deadline already passed, still not done)
            var overdueTasks = await context.TaskItems
                .Include(t => t.Assignments)
                .Where(t =>
                    t.Status != "Done" &&
                    t.Deadline < now &&
                    !t.NotifiedOverdue)
                .ToListAsync();

            foreach (var task in overdueTasks)
            {
                // Generate missed task message using OpenAI
                var overdueMessage = await GenerateOverdueMessageAsync(task.Title);

                foreach (var assignment in task.Assignments)
                {
                    context.Notifications.Add(new Notification
                    {
                        Title = "Task Missed",
                        Message = overdueMessage,
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false,
                        UserId = assignment.UserId
                    });
                }

                // Mark as notified so it doesn't fire again
                task.NotifiedOverdue = true;
            }

            await context.SaveChangesAsync();
        }

        private async Task<string> GenerateNotificationMessageAsync(string taskTitle, string timeLeft)
        {
            try
            {
                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new
                        {
                            role = "user",
                            content = $"Write a short friendly reminder (max 2 sentences) for a student whose task '{taskTitle}' is due in {timeLeft}. Be motivating and clear."
                        }
                    },
                    max_tokens = 100
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
                request.Headers.Add("Authorization", $"Bearer {_openAiApiKey}");
                request.Content = JsonContent.Create(requestBody);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                    return FallbackMessage(taskTitle, timeLeft); // 👈 fallback if API fails

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                return json
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? FallbackMessage(taskTitle, timeLeft);
            }
            catch
            {
                // If OpenAI is down, use fallback message so the app doesn't break
                return FallbackMessage(taskTitle, timeLeft);
            }
        }

        private async Task<string> GenerateOverdueMessageAsync(string taskTitle)
        {
            try
            {
                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                new
                {
                    role = "user",
                    content = $"Write a short, direct message (max 2 sentences) telling a student that they missed the deadline for their task '{taskTitle}'. Be firm but constructive."
                }
            },
                    max_tokens = 100
                };

                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    "https://api.openai.com/v1/chat/completions");

                request.Headers.Add("Authorization", $"Bearer {_openAiApiKey}");
                request.Content = JsonContent.Create(requestBody);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                    return FallbackOverdueMessage(taskTitle);

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                return json
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? FallbackOverdueMessage(taskTitle);
            }
            catch
            {
                return FallbackOverdueMessage(taskTitle);
            }
        }

        private string FallbackOverdueMessage(string taskTitle)
        {
            return $"You have missed the deadline for task '{taskTitle}'.";
        }

        // Fallback in case OpenAI API fails
        private string FallbackMessage(string taskTitle, string timeLeft)
        {
            return $"Reminder: Your task '{taskTitle}' is due in {timeLeft}. Please make sure to complete it on time!";
        }
    }
}
