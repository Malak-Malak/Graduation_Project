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

        // FIX Bug 3: GetTeamIdAsync now requires the teamId to be passed explicitly
        // for supervisors, because a supervisor can oversee multiple teams.
        // The old version grabbed the FIRST team found, which was random and wrong.
        //
        // For students: teamId is always unique (one team per student), so we look it up.
        // For supervisors: they must pass a teamId explicitly in the DTO.
        private async Task<int?> GetStudentTeamIdAsync(int userId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            return teamMember?.TeamId;
        }

        // Get files uploaded by supervisor (for a specific team)
        public async Task<List<AttachmentDto>> GetSupervisorFilesAsync(int userId)
        {
            // Supervisor sees files across all their teams grouped — or per team if teamId provided.
            // Here we return all files the supervisor uploaded across all their teams.
            var supervisorTeamIds = await _context.Teams
                .Where(t => t.SupervisorId == userId)
                .Select(t => t.Id)
                .ToListAsync();

            return await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => supervisorTeamIds.Contains(f.TeamId) && f.UserId == userId)
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

        // Get files uploaded by students (for the supervisor's teams or the student's own team)
        public async Task<List<AttachmentDto>> GetStudentFilesAsync(int userId)
        {
            // If the caller is a student, get their team
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            int? teamId = teamMember?.TeamId;

            // If the caller is a supervisor, get all their teams
            if (teamId == null)
            {
                var supervisorTeamIds = await _context.Teams
                    .Where(t => t.SupervisorId == userId)
                    .Select(t => t.Id)
                    .ToListAsync();

                if (!supervisorTeamIds.Any()) return new List<AttachmentDto>();

                return await _context.ProjectFiles
                    .Include(f => f.User)
                        .ThenInclude(u => u.UserProfile)
                    .Include(f => f.Team)
                    .Where(f => supervisorTeamIds.Contains(f.TeamId) && f.UserId != userId)
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

        // Add attachment
        // FIX Bug 3: For students, team is looked up automatically (one team only).
        // For supervisors, the DTO must include a TeamId to avoid attaching to the wrong team.
        public async Task<bool> AddAttachmentAsync(int userId, AddAttachmentDto dto)
        {
            int? teamId;

            // Check if user is a student
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            if (teamMember != null)
            {
                // Student: use their team
                teamId = teamMember.TeamId;
            }
            else
            {
                // Supervisor: must provide a TeamId in the DTO
                if (dto.TeamId == null) return false;

                // Verify this supervisor actually supervises that team
                var owns = await _context.Teams
                    .AnyAsync(t => t.Id == dto.TeamId && t.SupervisorId == userId);

                if (!owns) return false;

                teamId = dto.TeamId;
            }

            _context.ProjectFiles.Add(new ProjectFile
            {
                FilePath = dto.FilePath,
                FileName = dto.FileName,
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
            attachment.FileName = dto.FileName;
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