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

        // Get files uploaded by supervisor
        public async Task<List<AttachmentDto>> GetSupervisorFilesAsync(int userId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return new List<AttachmentDto>();

            // Get supervisor id for this team
            var team = await _context.Teams.FindAsync(teamId);
            if (team == null) return new List<AttachmentDto>();

            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.TeamId == teamId && f.UserId == team.SupervisorId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new AttachmentDto
                {
                    Id = f.Id,
                    FilePath = f.FilePath,
                    Description = f.Description,
                    UploadedAt = f.UploadedAt,
                    UploadedByUserId = f.UserId,
                    UploadedByName = f.User.UserProfile != null
                        ? f.User.UserProfile.FullName
                        : f.User.Username
                })
                .ToListAsync();
        }

        // Get files uploaded by students
        public async Task<List<AttachmentDto>> GetStudentFilesAsync(int userId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return new List<AttachmentDto>();

            var team = await _context.Teams.FindAsync(teamId);
            if (team == null) return new List<AttachmentDto>();

            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.TeamId == teamId && f.UserId != team.SupervisorId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new AttachmentDto
                {
                    Id = f.Id,
                    FilePath = f.FilePath,
                    Description = f.Description,
                    UploadedAt = f.UploadedAt,
                    UploadedByUserId = f.UserId,
                    UploadedByName = f.User.UserProfile != null
                        ? f.User.UserProfile.FullName
                        : f.User.Username
                })
                .ToListAsync();
        }

        // Add attachment
        public async Task<bool> AddAttachmentAsync(int userId, AddAttachmentDto dto)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            _context.ProjectFiles.Add(new ProjectFile
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
            var attachment = await _context.ProjectFiles
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
            var attachment = await _context.ProjectFiles
                .FirstOrDefaultAsync(ta => ta.Id == attachmentId && ta.UserId == userId);

            if (attachment == null) return false;

            _context.ProjectFiles.Remove(attachment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}