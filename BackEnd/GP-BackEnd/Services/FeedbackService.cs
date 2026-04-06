using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Feedback;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class FeedbackService
    {
        private readonly ApplicationDbContext _context;

        public FeedbackService(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task<int> GetUserVersionAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user?.CurrentVersion ?? 0;
        }

        // Get all feedbacks for a team
        public async Task<List<FeedbackDto>> GetTeamFeedbacksAsync(int userId, int teamId)
        {
            var version = await GetUserVersionAsync(userId);

            var feedbacks = await _context.Feedbacks
                .Include(f => f.Sender)
                    .ThenInclude(s => s.UserProfile)
                .Include(f => f.TaskItem)
                .Include(f => f.ProjectFile)        // ✅ added
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Sender)
                        .ThenInclude(s => s.UserProfile)
                .Where(f => f.TeamId == teamId
                    && f.ParentFeedbackId == null
                    && f.Version == version)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return feedbacks.Select(f => new FeedbackDto
            {
                Id = f.Id,
                Content = f.Content,
                CreatedAt = f.CreatedAt,
                SenderName = f.Sender.UserProfile != null
                    ? f.Sender.UserProfile.FullName
                    : f.Sender.Username,
                SenderRole = f.Sender.Role,
                TaskItemId = f.TaskItemId,
                TaskItemTitle = f.TaskItem != null ? f.TaskItem.Title : null,
                ProjectFileId = f.ProjectFileId,    // ✅ added
                Version = f.Version,
                Replies = f.Replies.Select(r => new ReplyDto
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    SenderName = r.Sender.UserProfile != null
                        ? r.Sender.UserProfile.FullName
                        : r.Sender.Username,
                    SenderRole = r.Sender.Role
                }).OrderBy(r => r.CreatedAt).ToList()
            }).ToList();
        }

        // Supervisor creates feedback
        public async Task<bool> CreateFeedbackAsync(int supervisorId, CreateFeedbackDto dto)
        {
            // Check supervisor owns this team
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId && t.SupervisorId == supervisorId);

            if (team == null) return false;

            var version = await GetUserVersionAsync(supervisorId);

            var feedback = new Feedback
            {
                Content = dto.Content,
                SenderId = supervisorId,
                TeamId = dto.TeamId,
                TaskItemId = dto.TaskItemId,
                ProjectFileId = dto.ProjectFileId,  // ✅ added
                Version = version,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Notify all team members
            foreach (var member in team.TeamMembers)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "New Feedback",
                    Message = dto.ProjectFileId != null
                        ? "Your supervisor added feedback on a file."
                        : dto.TaskItemId != null
                            ? "Your supervisor added feedback on a task."
                            : "Your supervisor added new feedback.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Student adds a reply to a feedback
        public async Task<bool> AddReplyAsync(int studentId, AddReplyDto dto)
        {
            // Check parent feedback exists
            var parentFeedback = await _context.Feedbacks
                .Include(f => f.Team)
                    .ThenInclude(t => t.TeamMembers)
                .FirstOrDefaultAsync(f => f.Id == dto.ParentFeedbackId
                    && f.ParentFeedbackId == null);

            if (parentFeedback == null) return false;

            // Check student is in the team
            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == parentFeedback.TeamId && tm.UserId == studentId);

            if (!isMember) return false;

            var version = await GetUserVersionAsync(studentId);

            var reply = new Feedback
            {
                Content = dto.Content,
                SenderId = studentId,
                TeamId = parentFeedback.TeamId,
                TaskItemId = parentFeedback.TaskItemId,
                ProjectFileId = parentFeedback.ProjectFileId,  // ✅ added
                ParentFeedbackId = dto.ParentFeedbackId,
                Version = version,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(reply);

            // Notify supervisor
            _context.Notifications.Add(new Notification
            {
                Title = "New Reply",
                Message = "A student replied to your feedback.",
                CreatedAt = DateTime.UtcNow,
                UserId = parentFeedback.Team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Delete a feedback (supervisor only, deletes replies too via cascade)
        public async Task<bool> DeleteFeedbackAsync(int supervisorId, int feedbackId)
        {
            var feedback = await _context.Feedbacks
                .FirstOrDefaultAsync(f => f.Id == feedbackId
                    && f.SenderId == supervisorId
                    && f.ParentFeedbackId == null);

            if (feedback == null) return false;

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }

        // Delete a reply (only the one who wrote it)
        public async Task<bool> DeleteReplyAsync(int userId, int replyId)
        {
            var reply = await _context.Feedbacks
                .FirstOrDefaultAsync(f => f.Id == replyId
                    && f.SenderId == userId
                    && f.ParentFeedbackId != null);

            if (reply == null) return false;

            _context.Feedbacks.Remove(reply);
            await _context.SaveChangesAsync();
            return true;
        }

        // Edit a feedback (supervisor only)
        public async Task<bool> EditFeedbackAsync(int supervisorId, int feedbackId, string newContent)
        {
            var feedback = await _context.Feedbacks
                .FirstOrDefaultAsync(f => f.Id == feedbackId
                    && f.SenderId == supervisorId
                    && f.ParentFeedbackId == null);

            if (feedback == null) return false;

            feedback.Content = newContent;
            await _context.SaveChangesAsync();
            return true;
        }

        // Edit a reply (only the one who wrote it)
        public async Task<bool> EditReplyAsync(int userId, int replyId, string newContent)
        {
            var reply = await _context.Feedbacks
                .FirstOrDefaultAsync(f => f.Id == replyId
                    && f.SenderId == userId
                    && f.ParentFeedbackId != null);

            if (reply == null) return false;

            reply.Content = newContent;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}