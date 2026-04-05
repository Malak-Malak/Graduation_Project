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

        // Get team id for any user (student or supervisor)
        private async Task<int?> GetTeamIdAsync(int userId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            if (teamMember != null) return teamMember.TeamId;

            var supervisorTeam = await _context.Teams
                .FirstOrDefaultAsync(t => t.SupervisorId == userId);

            return supervisorTeam?.Id;
        }

        // Get all attachments for a team
        public async Task<List<AttachmentDto>> GetAttachmentsAsync(int userId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return new List<AttachmentDto>();

            return await _context.TaskAttachments
                .Include(ta => ta.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(ta => ta.TeamId == teamId)
                .OrderByDescending(ta => ta.UploadedAt)
                .Select(ta => new AttachmentDto
                {
                    Id = ta.Id,
                    FilePath = ta.FilePath,
                    Description = ta.Description,
                    UploadedAt = ta.UploadedAt,
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
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            _context.TaskAttachments.Add(new ProjectFile
            {
                FilePath = dto.FilePath,
                Description = dto.Description,
                UploadedAt = DateTime.UtcNow,
                TeamId = teamId.Value,
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