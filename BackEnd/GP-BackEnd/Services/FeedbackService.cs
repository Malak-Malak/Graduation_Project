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

        private async Task NotifyTeamAsync(int teamId, string title, string message)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null) return;

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
        //
        // FIX: Removed the Version filter entirely for file-based feedback.
        //
        // WHY: ProjectFile has no Version field — files are shared across both
        // versions of the website. When the supervisor adds feedback on a file,
        // the Feedback row gets stamped with the supervisor's CurrentVersion (e.g. 0).
        // Any student who has switched to version 1 calls this endpoint and the
        // old filter (f.Version == user.CurrentVersion == 1) returns EMPTY — even
        // though they're looking at the exact same file.
        //
        // Version filtering makes sense for Kanban task feedback (tasks are versioned).
        // For FILE feedback, the file itself is the version context.
        // All feedback on a file belongs to that file regardless of who is on which version.

        public async Task<List<FeedbackDto>> GetFeedbacksByFileAsync(int userId, int fileId)
        {
            var file = await _context.ProjectFiles
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null) return new List<FeedbackDto>();

            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == file.TeamId && tm.UserId == userId);

            var isSupervisor = await _context.Teams
                .AnyAsync(t => t.Id == file.TeamId && t.SupervisorId == userId);

            if (!isMember && !isSupervisor) return new List<FeedbackDto>();

            // No version filter — all feedback on this file is shown to everyone
            var feedbacks = await _context.Feedbacks
                .Include(f => f.Sender)
                    .ThenInclude(s => s.UserProfile)
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Sender)
                        .ThenInclude(s => s.UserProfile)
                .Where(f => f.ProjectFileId == fileId
                    && f.ParentFeedbackId == null)
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
                // No version filter on replies either — all replies belong to their parent
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
        //
        // FIX: Removed the version mismatch guard and changed reply.Version
        // to inherit from the parent feedback (not from the replier's CurrentVersion).
        //
        // Since file-based feedback no longer filters by version when reading,
        // the version field on replies is kept for data consistency but is not
        // used as a gate. Anyone on any version can reply to any feedback on a file.

        public async Task<bool> AddReplyAsync(int userId, AddReplyDto dto)
        {
            var parentFeedback = await _context.Feedbacks
                .Include(f => f.Team)
                    .ThenInclude(t => t.TeamMembers)
                .FirstOrDefaultAsync(f => f.Id == dto.ParentFeedbackId
                    && f.ParentFeedbackId == null);

            if (parentFeedback == null) return false;

            var isMember = parentFeedback.Team.TeamMembers.Any(tm => tm.UserId == userId);
            var isSupervisor = parentFeedback.Team.SupervisorId == userId;

            if (!isMember && !isSupervisor) return false;

            var reply = new Feedback
            {
                Content = dto.Content,
                SenderId = userId,
                TeamId = parentFeedback.TeamId,
                ProjectFileId = parentFeedback.ProjectFileId,
                TaskItemId = null,
                ParentFeedbackId = dto.ParentFeedbackId,
                // Inherit the parent feedback's version for data consistency
                Version = parentFeedback.Version,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(reply);
            await _context.SaveChangesAsync();

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