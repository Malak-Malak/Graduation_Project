using GP_BackEnd.Data;
using GP_BackEnd.DTOs.FileSystem;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class FileSystemService
    {
        private readonly ApplicationDbContext _context;

        public FileSystemService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Check if user has access to the task (is a team member or supervisor)
        private async Task<bool> HasAccessAsync(int userId, int taskItemId)
        {
            var task = await _context.TaskItems
                .FirstOrDefaultAsync(t => t.Id == taskItemId);

            if (task == null) return false;

            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == task.TeamId && tm.UserId == userId);

            var isSupervisor = await _context.Teams
                .AnyAsync(t => t.Id == task.TeamId && t.SupervisorId == userId);

            return isMember || isSupervisor;
        }

        // Get all attachments for a task
        public async Task<List<AttachmentDto>> GetAttachmentsAsync(int userId)
        {
            // Check if user is a team member or supervisor
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            int? teamId = null;

            if (teamMember != null)
            {
                teamId = teamMember.TeamId;
            }
            else
            {
                // Check if supervisor
                var supervisorTeam = await _context.Teams
                    .FirstOrDefaultAsync(t => t.SupervisorId == userId);
                teamId = supervisorTeam?.Id;
            }

            if (teamId == null) return new List<AttachmentDto>();

            return await _context.TaskAttachments
                .Include(ta => ta.TaskItem)
                .Include(ta => ta.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(ta => ta.TaskItem.TeamId == teamId)
                .Select(ta => new AttachmentDto
                {
                    Id = ta.Id,
                    FilePath = ta.FilePath,
                    Description = ta.Description,
                    UploadedAt = ta.UploadedAt,
                    TaskItemId = ta.TaskItemId,
                    TaskTitle = ta.TaskItem.Title,
                    UploadedByUserId = ta.UserId,
                    UploadedByName = ta.User.UserProfile != null
                        ? ta.User.UserProfile.FullName
                        : ta.User.Username
                })
                .ToListAsync();
        }

        // Add attachment
        public async Task<bool> AddAttachmentAsync(int userId, AddAttachmentDto dto)
        {
            if (!await HasAccessAsync(userId, dto.TaskItemId))
                return false;

            _context.TaskAttachments.Add(new TaskAttachment
            {
                FilePath = dto.FilePath,
                Description = dto.Description,
                UploadedAt = DateTime.UtcNow,
                TaskItemId = dto.TaskItemId,
                UserId = userId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Edit attachment (only the one who uploaded it)
        public async Task<bool> EditAttachmentAsync(int userId, int attachmentId, EditAttachmentDto dto)
        {
            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(ta => ta.Id == attachmentId && ta.UserId == userId);

            if (attachment == null) return false;

            attachment.FilePath = dto.FilePath;
            attachment.Description = dto.Description;

            await _context.SaveChangesAsync();
            return true;
        }

        // Delete attachment (only the one who uploaded it)
        public async Task<bool> DeleteAttachmentAsync(int userId, int attachmentId)
        {
            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(ta => ta.Id == attachmentId && ta.UserId == userId);

            if (attachment == null) return false;

            _context.TaskAttachments.Remove(attachment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}