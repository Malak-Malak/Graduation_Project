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

        // Notify all team members + supervisor
        private async Task NotifyTeamAsync(int teamId, string title, string message)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null) return;

            // Collect all user IDs: members + supervisor
            var userIds = team.TeamMembers.Select(m => m.UserId).ToList();
            if (!userIds.Contains(team.SupervisorId))
                userIds.Add(team.SupervisorId);

            foreach (var userId in userIds)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = title,
                    Message = message,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                });
            }

            await _context.SaveChangesAsync();
        }

        // ── GET feedbacks for a file ──────────────────────────────────────────

        public async Task<List<FeedbackDto>> GetFeedbacksByFileAsync(int userId, int fileId)
        {
            // Verify user belongs to the team that owns this file
            var file = await _context.ProjectFiles
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null) return new List<FeedbackDto>();

            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == file.TeamId && tm.UserId == userId);

            var isSupervisor = await _context.Teams
                .AnyAsync(t => t.Id == file.TeamId && t.SupervisorId == userId);

            if (!isMember && !isSupervisor) return new List<FeedbackDto>();

            var version = await GetUserVersionAsync(userId);

            var feedbacks = await _context.Feedbacks
                .Include(f => f.Sender)
                    .ThenInclude(s => s.UserProfile)
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Sender)
                        .ThenInclude(s => s.UserProfile)
                .Where(f => f.ProjectFileId == fileId
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
                ProjectFileId = f.ProjectFileId ?? 0,
                Version = f.Version,
                Replies = f.Replies
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => new ReplyDto
                    {
                        Id = r.Id,
                        Content = r.Content,
                        CreatedAt = r.CreatedAt,
                        SenderName = r.Sender.UserProfile != null
                            ? r.Sender.UserProfile.FullName
                            : r.Sender.Username,
                        SenderRole = r.Sender.Role
                    }).ToList()
            }).ToList();
        }

        // ── CREATE feedback (supervisor only) ─────────────────────────────────

        public async Task<bool> CreateFeedbackAsync(int supervisorId, CreateFeedbackDto dto)
        {
            // Verify the file exists and belongs to a team supervised by this supervisor
            var file = await _context.ProjectFiles
                .Include(f => f.Team)
                .FirstOrDefaultAsync(f => f.Id == dto.ProjectFileId
                    && f.Team.SupervisorId == supervisorId);

            if (file == null) return false;

            var version = await GetUserVersionAsync(supervisorId);

            var feedback = new Feedback
            {
                Content = dto.Content,
                SenderId = supervisorId,
                TeamId = file.TeamId,
                ProjectFileId = dto.ProjectFileId,
                TaskItemId = null,
                Version = version,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Notify everyone
            var senderName = await _context.UserProfiles
                .Where(p => p.UserId == supervisorId)
                .Select(p => p.FullName)
                .FirstOrDefaultAsync()
                ?? (await _context.Users.FindAsync(supervisorId))?.Username
                ?? "Your supervisor";

            await NotifyTeamAsync(
                file.TeamId,
                "New Feedback",
                $"{senderName} added feedback on file \"{file.FileName ?? file.FilePath}\"."
            );

            return true;
        }

        // ── ADD reply (any team member or supervisor) ─────────────────────────

        public async Task<bool> AddReplyAsync(int userId, AddReplyDto dto)
        {
            // Find parent feedback
            var parentFeedback = await _context.Feedbacks
                .Include(f => f.Team)
                    .ThenInclude(t => t.TeamMembers)
                .FirstOrDefaultAsync(f => f.Id == dto.ParentFeedbackId
                    && f.ParentFeedbackId == null);

            if (parentFeedback == null) return false;

            // Check user is a team member OR the supervisor
            var isMember = parentFeedback.Team.TeamMembers.Any(tm => tm.UserId == userId);
            var isSupervisor = parentFeedback.Team.SupervisorId == userId;

            if (!isMember && !isSupervisor) return false;

            var version = await GetUserVersionAsync(userId);

            var reply = new Feedback
            {
                Content = dto.Content,
                SenderId = userId,
                TeamId = parentFeedback.TeamId,
                ProjectFileId = parentFeedback.ProjectFileId,
                TaskItemId = null,
                ParentFeedbackId = dto.ParentFeedbackId,
                Version = version,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(reply);
            await _context.SaveChangesAsync();

            // Notify everyone
            var senderName = await _context.UserProfiles
                .Where(p => p.UserId == userId)
                .Select(p => p.FullName)
                .FirstOrDefaultAsync()
                ?? (await _context.Users.FindAsync(userId))?.Username
                ?? "Someone";

            await NotifyTeamAsync(
                parentFeedback.TeamId,
                "New Reply",
                $"{senderName} replied to a feedback."
            );

            return true;
        }

        // ── EDIT feedback (supervisor only) ───────────────────────────────────

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

        // ── EDIT reply (only the one who wrote it) ────────────────────────────

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

        // ── DELETE feedback (supervisor only, cascade deletes replies) ─────────

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

        // ── DELETE reply (only the one who wrote it) ──────────────────────────

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
    }
}