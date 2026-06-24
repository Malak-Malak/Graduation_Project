using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Supervisor;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class SupervisorService
    {
        private readonly ApplicationDbContext _context;

        public SupervisorService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all pending team requests for this supervisor
        public async Task<List<PendingTeamDto>> GetPendingTeamRequestsAsync(int supervisorId)
        {
            return await _context.Teams
                .Include(t => t.CreatedBy)
                .Include(t => t.TeamMembers)
                .Where(t => t.SupervisorId == supervisorId && t.Status == "Pending")
                .Select(t => new PendingTeamDto
                {
                    Id = t.Id,
                    ProjectTitle = t.ProjectTitle,
                    CreatedByUsername = t.CreatedBy.Username,
                    MembersCount = t.TeamMembers.Count
                })
                .ToListAsync();
        }

        // Supervisor approves or rejects a team request
        public async Task<bool> RespondToTeamRequestAsync(int supervisorId, RespondToTeamRequestDto dto)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId && t.SupervisorId == supervisorId);

            if (team == null) return false;
            if (team.Status != "Pending") return false;

            if (dto.IsApproved)
            {
                // Count current students across all active teams for this supervisor
                var currentStudentCount = await _context.TeamMembers
                    .Include(tm => tm.Team)
                    .Where(tm => tm.Team.SupervisorId == supervisorId && tm.Team.Status == "Active")
                    .CountAsync();

                // Count students in the pending team being approved
                var newTeamStudentCount = team.TeamMembers.Count;

                // Block if approving would exceed 18 students
                if (currentStudentCount + newTeamStudentCount > 18)
                    return false;

                team.Status = "Active";

                foreach (var member in team.TeamMembers)
                {
                    _context.Notifications.Add(new Notification
                    {
                        Title = "Team Approved",
                        Message = $"Your team '{team.ProjectTitle}' has been approved by the supervisor.",
                        CreatedAt = DateTime.UtcNow,
                        UserId = member.UserId
                    });
                }
            }
            else
            {
                team.Status = "Rejected";

                foreach (var member in team.TeamMembers)
                {
                    _context.Notifications.Add(new Notification
                    {
                        Title = "Team Rejected",
                        Message = $"Your team '{team.ProjectTitle}' has been rejected by the supervisor.",
                        CreatedAt = DateTime.UtcNow,
                        UserId = member.UserId
                    });
                }
                _context.TeamMembers.RemoveRange(team.TeamMembers);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Supervisor responds to leave request
        public async Task<bool> RespondToLeaveRequestAsync(int supervisorId, RespondToLeaveRequestDto dto)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.Id == dto.TeamMemberId
                    && tm.Team.SupervisorId == supervisorId
                    && tm.HasRequestedLeave);

            if (teamMember == null) return false;

            if (dto.IsApproved)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "Leave Request Approved",
                    Message = "Your request to leave the team has been approved.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = teamMember.UserId
                });

                var teamId = teamMember.TeamId;
                _context.TeamMembers.Remove(teamMember);

                // Check if team has no members left → disband
                var remainingMembers = await _context.TeamMembers
                    .CountAsync(tm => tm.TeamId == teamId && tm.Id != dto.TeamMemberId);

                if (remainingMembers == 0)
                {
                    var team = await _context.Teams.FindAsync(teamId);
                    if (team != null) _context.Teams.Remove(team);
                }
            }
            else
            {
                teamMember.HasRequestedLeave = false;
                teamMember.LeaveStatus = "Rejected";

                _context.Notifications.Add(new Notification
                {
                    Title = "Leave Request Rejected",
                    Message = "Your request to leave the team has been rejected.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = teamMember.UserId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Supervisor sets or updates max teams
        public async Task<bool> SetMaxTeamsAsync(int supervisorId, SetMaxTeamsDto dto)
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == supervisorId);

            if (profile == null)
            {
                // Create profile if not exists
                _context.UserProfiles.Add(new UserProfile
                {
                    UserId = supervisorId,
                    MaxTeams = dto.MaxTeams,
                    FullName = "",
                    Department = "",
                    PhoneNumber = ""
                });
            }
            else
            {
                profile.MaxTeams = dto.MaxTeams;
            }

            await _context.SaveChangesAsync();
            return true;
        }
        // Get all teams under supervision
        public async Task<List<SupervisedTeamDto>> GetMyTeamsAsync(int supervisorId)
        {
            return await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Project)
                .Where(t => t.SupervisorId == supervisorId)
                .Select(t => new SupervisedTeamDto
                {
                    Id = t.Id,
                    ProjectTitle = t.ProjectTitle,
                    ProjectDescription = t.Project != null ? t.Project.Description : "",
                    Status = t.Status,
                    Members = t.TeamMembers.Select(tm => new SupervisedTeamMemberDto
                    {
                        UserId = tm.UserId,
                        Username = tm.User.Username,
                        FullName = tm.User.UserProfile != null
                            ? tm.User.UserProfile.FullName
                            : tm.User.Username
                    }).ToList()
                })
                .ToListAsync();
        }

        // Get specific team by id
        public async Task<SupervisedTeamDto?> GetTeamByIdAsync(int supervisorId, int teamId)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == teamId && t.SupervisorId == supervisorId);

            if (team == null) return null;

            return new SupervisedTeamDto
            {
                Id = team.Id,
                ProjectTitle = team.ProjectTitle,
                ProjectDescription = team.Project != null ? team.Project.Description : "",
                Status = team.Status,
                Members = team.TeamMembers.Select(tm => new SupervisedTeamMemberDto
                {
                    UserId = tm.UserId,
                    Username = tm.User.Username,
                    FullName = tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username
                }).ToList()
            };
        }

        // Get total number of teams
        public async Task<int> GetTotalTeamsCountAsync(int supervisorId)
        {
            return await _context.Teams
                .CountAsync(t => t.SupervisorId == supervisorId);
        }
        // Get all leave requests for supervisor's teams
        public async Task<List<LeaveRequestDto>> GetLeaveRequestsAsync(int supervisorId)
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(tm => tm.Team)
                .Where(tm => tm.Team.SupervisorId == supervisorId && tm.HasRequestedLeave)
                .Select(tm => new LeaveRequestDto
                {
                    TeamMemberId = tm.Id,
                    TeamId = tm.TeamId,
                    TeamName = tm.Team.ProjectTitle,
                    UserId = tm.UserId,
                    Username = tm.User.Username,
                    FullName = tm.User.UserProfile != null ? tm.User.UserProfile.FullName : tm.User.Username,
                    LeaveStatus = tm.LeaveStatus
                })
                .ToListAsync();
        }
        public async Task<List<TeamOverviewDto>> GetAllTeamsOverviewAsync(int supervisorId)
        {
            var teams = await _context.Teams
                .Where(t => t.SupervisorId == supervisorId)
                .ToListAsync();

            var result = new List<TeamOverviewDto>();

            foreach (var team in teams)
            {
                // Get all tasks for both phases
                var tasks = await _context.TaskItems
                    .Include(t => t.CreatedBy)
                        .ThenInclude(u => u.UserProfile)
                    .Include(t => t.Assignments)
                        .ThenInclude(a => a.User)
                            .ThenInclude(u => u.UserProfile)
                    .Where(t => t.TeamId == team.Id)
                    .ToListAsync();

                // Get student files for this team
                var studentFiles = await _context.ProjectFiles
                    .Include(f => f.User)
                        .ThenInclude(u => u.UserProfile)
                    .Where(f => f.TeamId == team.Id && f.UserId != supervisorId)
                    .ToListAsync();

                // Get supervisor shared files (TeamId = null)
                var supervisorFiles = await _context.ProjectFiles
                    .Include(f => f.User)
                        .ThenInclude(u => u.UserProfile)
                    .Where(f => f.UserId == supervisorId && f.TeamId == null)
                    .ToListAsync();

                result.Add(new TeamOverviewDto
                {
                    TeamId = team.Id,
                    TeamName = team.ProjectTitle,
                    Status = team.Status,
                    TasksPhase1 = tasks.Where(t => t.Version == 0).Select(t => new DTOs.Kanban.TaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        Status = t.Status,
                        Priority = t.Priority,
                        Deadline = t.Deadline,
                        CreatedBy = t.CreatedBy?.UserProfile != null
                            ? t.CreatedBy.UserProfile.FullName
                            : t.CreatedBy?.Username ?? "",
                        AssignedMembers = t.Assignments?.Select(a => new DTOs.Kanban.AssignedMemberDto
                        {
                            UserId = a.UserId,
                            Username = a.User?.Username ?? "",
                            FullName = a.User?.UserProfile != null
                                ? a.User.UserProfile.FullName
                                : a.User?.Username ?? ""
                        }).ToList() ?? new List<DTOs.Kanban.AssignedMemberDto>()
                    }).ToList(),
                    TasksPhase2 = tasks.Where(t => t.Version == 1).Select(t => new DTOs.Kanban.TaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        Status = t.Status,
                        Priority = t.Priority,
                        Deadline = t.Deadline,
                        CreatedBy = t.CreatedBy?.UserProfile != null
                            ? t.CreatedBy.UserProfile.FullName
                            : t.CreatedBy?.Username ?? "",
                        AssignedMembers = t.Assignments?.Select(a => new DTOs.Kanban.AssignedMemberDto
                        {
                            UserId = a.UserId,
                            Username = a.User?.Username ?? "",
                            FullName = a.User?.UserProfile != null
                                ? a.User.UserProfile.FullName
                                : a.User?.Username ?? ""
                        }).ToList() ?? new List<DTOs.Kanban.AssignedMemberDto>()
                    }).ToList(),
                    StudentFiles = studentFiles.Select(f => new DTOs.FileSystem.AttachmentDto
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
                    }).ToList(),
                    SupervisorFiles = supervisorFiles.Select(f => new DTOs.FileSystem.AttachmentDto
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
                    }).ToList()
                });
            }

            return result;
        }
    }
}