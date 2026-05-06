using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Archive;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class ArchiveService
    {
        private readonly ApplicationDbContext _context;

        public ArchiveService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Student submits project
        public async Task<bool> SubmitProjectAsync(int studentId, int version)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId && tm.Team.Status == "Active");

            if (teamMember == null) return false;
            if (teamMember.Team.IsSubmitted) return false;

            teamMember.Team.IsSubmitted = true;

            // Notify supervisor
            _context.Notifications.Add(new Models.Notification
            {
                Title = "Project Submitted",
                Message = $"Team '{teamMember.Team.ProjectTitle}' has submitted their project for review.",
                CreatedAt = DateTime.UtcNow,
                UserId = teamMember.Team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Supervisor gets submitted teams
        public async Task<List<SubmittedTeamDto>> GetSubmittedTeamsAsync(int supervisorId)
        {
            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Project)
                .Where(t => t.SupervisorId == supervisorId && t.IsSubmitted && !t.IsArchived)
                .ToListAsync();

            return teams.Select(t => new SubmittedTeamDto
            {
                TeamId = t.Id,
                ProjectName = t.ProjectTitle,
                ProjectDescription = t.Project != null ? t.Project.Description : "",
                GithubRepo = t.GithubRepo,
                MemberNames = t.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username)
                    .ToList(),
                Version = t.TeamMembers
                    .Select(tm => tm.User.CurrentVersion)
                    .FirstOrDefault()
            }).ToList();
        }

        // Supervisor sends to archive
        public async Task<bool> SendToArchiveAsync(int supervisorId, SendToArchiveDto dto)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId
                    && t.SupervisorId == supervisorId
                    && t.IsSubmitted
                    && !t.IsArchived);

            if (team == null) return false;

            // Delete tasks and assignments
            var tasks = await _context.TaskItems
                .Where(ti => ti.TeamId == dto.TeamId && ti.Version == dto.Version)
                .ToListAsync();
            _context.TaskItems.RemoveRange(tasks);

            // Delete feedbacks
            var feedbacks = await _context.Feedbacks
                .Where(f => f.TeamId == dto.TeamId && f.Version == dto.Version)
                .ToListAsync();
            _context.Feedbacks.RemoveRange(feedbacks);

            // Delete appointments
            var appointments = await _context.Appointments
                .Where(a => a.TeamId == dto.TeamId)
                .ToListAsync();
            _context.Appointments.RemoveRange(appointments);

            // Delete progress reports
            var reports = await _context.TeamProgressReports
                .Where(r => r.TeamId == dto.TeamId && r.Version == dto.Version)
                .ToListAsync();
            _context.TeamProgressReports.RemoveRange(reports);

            // Delete notifications for team members
            var memberIds = team.TeamMembers.Select(tm => tm.UserId).ToList();
            var notifications = await _context.Notifications
                .Where(n => memberIds.Contains(n.UserId))
                .ToListAsync();
            _context.Notifications.RemoveRange(notifications);

            // Mark as archived
            team.IsArchived = true;
            team.ArchivedAt = DateTime.UtcNow;

            // Notify team members
            foreach (var member in team.TeamMembers)
            {
                _context.Notifications.Add(new Models.Notification
                {
                    Title = "Project Archived",
                    Message = $"Your project '{team.ProjectTitle}' has been archived by your supervisor.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Get all archived projects
        public async Task<List<ArchiveCardDto>> GetArchivedProjectsAsync()
        {
            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Include(t => t.Project)
                .Where(t => t.IsArchived)
                .ToListAsync();

            return teams.Select(t => new ArchiveCardDto
            {
                TeamId = t.Id,
                ProjectName = t.ProjectTitle,
                ProjectDescription = t.Project != null ? t.Project.Description : "",
                SupervisorName = t.Supervisor.UserProfile != null
                    ? t.Supervisor.UserProfile.FullName
                    : t.Supervisor.Username,
                Department = t.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.Department
                        : "")
                    .FirstOrDefault() ?? "",
                GithubRepo = t.GithubRepo,
                MemberNames = t.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username)
                    .ToList(),
                ArchivedAt = t.ArchivedAt ?? DateTime.UtcNow,
                Version = t.TeamMembers
                    .Select(tm => tm.User.CurrentVersion)
                    .FirstOrDefault()
            }).ToList();
        }

        // Get specific archived project
        public async Task<ArchiveCardDto?> GetArchivedProjectByIdAsync(int teamId)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == teamId && t.IsArchived);

            if (team == null) return null;

            return new ArchiveCardDto
            {
                TeamId = team.Id,
                ProjectName = team.ProjectTitle,
                ProjectDescription = team.Project != null ? team.Project.Description : "",
                SupervisorName = team.Supervisor.UserProfile != null
                    ? team.Supervisor.UserProfile.FullName
                    : team.Supervisor.Username,
                Department = team.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.Department
                        : "")
                    .FirstOrDefault() ?? "",
                GithubRepo = team.GithubRepo,
                MemberNames = team.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username)
                    .ToList(),
                ArchivedAt = team.ArchivedAt ?? DateTime.UtcNow,
                Version = team.TeamMembers
                    .Select(tm => tm.User.CurrentVersion)
                    .FirstOrDefault()
            };
        }
    }
}