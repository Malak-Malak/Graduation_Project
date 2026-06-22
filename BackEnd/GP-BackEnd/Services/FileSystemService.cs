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
            int supervisorId;

            // Check if caller is a student — get their supervisor
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            if (teamMember != null)
            {
                // Caller is a student — use their team's supervisor
                supervisorId = teamMember.Team.SupervisorId;
            }
            else
            {
                // Caller is a supervisor — use their own ID
                supervisorId = userId;
            }

            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.UserId == supervisorId && f.TeamId == null)
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
        public async Task<List<AttachmentDto>> GetStudentFilesAsync(int userId, int? teamId = null)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            if (teamMember != null)
            {
                // Student: return files from their team uploaded by students
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

            // Supervisor
            var supervisorTeamIds = await _context.Teams
                .Where(t => t.SupervisorId == userId)
                .Select(t => t.Id)
                .ToListAsync();

            if (!supervisorTeamIds.Any()) return new List<AttachmentDto>();

            // If teamId filter is provided, validate it belongs to this supervisor
            if (teamId != null)
            {
                if (!supervisorTeamIds.Contains(teamId.Value))
                    return new List<AttachmentDto>();

                return await _context.ProjectFiles
                    .Include(f => f.User)
                        .ThenInclude(u => u.UserProfile)
                    .Where(f => f.TeamId == teamId && f.UserId != userId)
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

            // No filter — return all student files across all supervisor's teams
            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
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
        // Get all files (supervisor shared + all student files) across all supervisor's teams
        public async Task<List<AttachmentDto>> GetAllFilesAsync(int supervisorId)
        {
            var supervisorTeamIds = await _context.Teams
                .Where(t => t.SupervisorId == supervisorId)
                .Select(t => t.Id)
                .ToListAsync();

            if (!supervisorTeamIds.Any()) return new List<AttachmentDto>();

            // Supervisor shared files (TeamId = null)
            var supervisorFiles = await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.UserId == supervisorId && f.TeamId == null)
                .ToListAsync();

            // Student files across all teams
            var studentFiles = await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.TeamId != null
                    && supervisorTeamIds.Contains(f.TeamId!.Value)
                    && f.UserId != supervisorId)
                .ToListAsync();

            return supervisorFiles
                .Concat(studentFiles)
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
                .ToList();
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