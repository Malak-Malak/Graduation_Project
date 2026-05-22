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

        // Get files uploaded by the supervisor — shared across all his teams (TeamId = null)
        public async Task<List<AttachmentDto>> GetSupervisorFilesAsync(int userId)
        {
            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.UserId == userId && f.TeamId == null)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new AttachmentDto
                {
                    Id = f.Id,
                    FileName = f.FileName,
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

        // Get files uploaded by students — only for the caller's team
        // If caller is a supervisor, return student files across all their teams
        public async Task<List<AttachmentDto>> GetStudentFilesAsync(int userId)
        {
            // Check if caller is a student
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            if (teamMember != null)
            {
                // Student: return files from their team uploaded by students (TeamId set, not the supervisor)
                var team = await _context.Teams.FindAsync(teamMember.TeamId);
                if (team == null) return new List<AttachmentDto>();

                return await _context.ProjectFiles
                    .Include(f => f.User)
                        .ThenInclude(u => u.UserProfile)
                    .Where(f => f.TeamId == teamMember.TeamId && f.UserId != team.SupervisorId)
                    .OrderByDescending(f => f.UploadedAt)
                    .Select(f => new AttachmentDto
                    {
                        Id = f.Id,
                        FileName = f.FileName,
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

            // Caller is a supervisor: return student files across all their teams
            var supervisorTeamIds = await _context.Teams
                .Where(t => t.SupervisorId == userId)
                .Select(t => t.Id)
                .ToListAsync();

            if (!supervisorTeamIds.Any()) return new List<AttachmentDto>();

            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(f => f.Team)
                .Where(f => f.TeamId != null
                    && supervisorTeamIds.Contains(f.TeamId!.Value)
                    && f.UserId != userId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new AttachmentDto
                {
                    Id = f.Id,
                    FileName = f.FileName,
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

        // Add file
        // Student: TeamId is set to their team automatically
        // Supervisor: TeamId is left null — file is shared across all his teams
        public async Task<bool> AddAttachmentAsync(int userId, AddAttachmentDto dto)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            int? teamId = null;

            if (teamMember != null)
            {
                // Student — attach to their team
                teamId = teamMember.TeamId;
            }
            else
            {
                // Supervisor — verify they are actually a supervisor (have at least one team)
                var isSupervisor = await _context.Teams
                    .AnyAsync(t => t.SupervisorId == userId);

                if (!isSupervisor) return false;

                // TeamId stays null — shared file
            }

            _context.ProjectFiles.Add(new ProjectFile
            {
                FilePath = dto.FilePath,
                FileName = dto.FileName,
                Description = dto.Description,
                UploadedAt = DateTime.UtcNow,
                TeamId = teamId,
                UserId = userId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Edit file (only the uploader)
        public async Task<bool> EditAttachmentAsync(int userId, int attachmentId, EditAttachmentDto dto)
        {
            var attachment = await _context.ProjectFiles
                .FirstOrDefaultAsync(f => f.Id == attachmentId && f.UserId == userId);

            if (attachment == null) return false;

            attachment.FilePath = dto.FilePath;
            attachment.FileName = dto.FileName;
            attachment.Description = dto.Description;

            await _context.SaveChangesAsync();
            return true;
        }

        // Delete file (only the uploader)
        public async Task<bool> DeleteAttachmentAsync(int userId, int attachmentId)
        {
            var attachment = await _context.ProjectFiles
                .FirstOrDefaultAsync(f => f.Id == attachmentId && f.UserId == userId);

            if (attachment == null) return false;

            _context.ProjectFiles.Remove(attachment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}