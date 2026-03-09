using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Team;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class TeamService
    {
        private readonly ApplicationDbContext _context;

        public TeamService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Create a team
        public async Task<bool> CreateTeamAsync(int studentId, CreateTeamDto dto)
        {
            var existingMember = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == studentId);

            if (existingMember) return false;

            var existingTeam = await _context.Teams
                .AnyAsync(t => t.CreatedByUserId == studentId && t.Status == "Pending");

            if (existingTeam) return false;

            var team = new Team
            {
                ProjectTitle = dto.ProjectTitle,
                SupervisorId = dto.SupervisorId,
                CreatedByUserId = studentId,
                Status = "Pending"
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            var teamMember = new TeamMember
            {
                TeamId = team.Id,
                UserId = studentId
            };

            _context.TeamMembers.Add(teamMember);

            _context.Notifications.Add(new Notification
            {
                Title = "New Team Request",
                Message = $"A student has requested you to supervise their team: {dto.ProjectTitle}",
                CreatedAt = DateTime.UtcNow,
                UserId = dto.SupervisorId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Get students not in any team
        public async Task<List<TeamMemberDto>> GetAvailableStudentsAsync()
        {
            var studentsInTeams = await _context.TeamMembers
                .Select(tm => tm.UserId)
                .ToListAsync();

            return await _context.Users
                .Where(u => u.Role == "Student" && !studentsInTeams.Contains(u.Id))
                .Select(u => new TeamMemberDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.UserProfile != null ? u.UserProfile.FullName : ""
                })
                .ToListAsync();
        }

        // Send join request to a student (Invitation from team)
        public async Task<bool> SendJoinRequestAsync(int senderId, SendJoinRequestDto dto)
        {
            var senderMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == senderId);

            if (senderMember == null) return false;

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == senderMember.TeamId);

            if (team == null) return false;

            var memberCount = await _context.TeamMembers
                .CountAsync(tm => tm.TeamId == team.Id);

            if (memberCount >= 4) return false;

            var existingRequest = await _context.TeamJoinRequests
                .AnyAsync(jr => jr.TeamId == team.Id && jr.StudentId == dto.StudentId && jr.Status == "Pending");

            if (existingRequest) return false;

            var studentInTeam = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == dto.StudentId);

            if (studentInTeam) return false;

            var joinRequest = new TeamJoinRequest
            {
                TeamId = team.Id,
                StudentId = dto.StudentId,
                Status = "Pending",
                RequestType = "Invitation",  // fixed
                SentAt = DateTime.UtcNow
            };

            _context.TeamJoinRequests.Add(joinRequest);

            _context.Notifications.Add(new Notification
            {
                Title = "Team Join Request",
                Message = $"You have been invited to join team: {team.ProjectTitle}",
                CreatedAt = DateTime.UtcNow,
                UserId = dto.StudentId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Student responds to invitation from team
        public async Task<bool> RespondToJoinRequestAsync(int studentId, RespondToJoinRequestDto dto)
        {
            var joinRequest = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == dto.JoinRequestId && jr.StudentId == studentId && jr.RequestType == "Invitation");

            if (joinRequest == null) return false;

            if (dto.IsAccepted)
            {
                joinRequest.Status = "Accepted";

                _context.TeamMembers.Add(new TeamMember
                {
                    TeamId = joinRequest.TeamId,
                    UserId = studentId
                });
            }
            else
            {
                joinRequest.Status = "Rejected";
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Get my team
        public async Task<TeamDto?> GetMyTeamAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == studentId);

            if (teamMember == null) return null;

            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .FirstOrDefaultAsync(t => t.Id == teamMember.TeamId);

            if (team == null) return null;

            return new TeamDto
            {
                Id = team.Id,
                ProjectTitle = team.ProjectTitle,
                Status = team.Status,
                SupervisorName = team.Supervisor.UserProfile != null
                    ? team.Supervisor.UserProfile.FullName
                    : team.Supervisor.Username,
                Members = team.TeamMembers.Select(tm => new TeamMemberDto
                {
                    UserId = tm.UserId,
                    Username = tm.User.Username,
                    FullName = tm.User.UserProfile != null ? tm.User.UserProfile.FullName : ""
                }).ToList()
            };
        }

        // Student requests to leave team
        public async Task<bool> RequestLeaveTeamAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == studentId);

            if (teamMember == null) return false;
            if (teamMember.HasRequestedLeave) return false;

            teamMember.HasRequestedLeave = true;
            teamMember.LeaveStatus = "Pending";

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == teamMember.TeamId);

            _context.Notifications.Add(new Notification
            {
                Title = "Leave Request",
                Message = "A student has requested to leave your team.",
                CreatedAt = DateTime.UtcNow,
                UserId = team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Supervisor approves or rejects leave request
        public async Task<bool> RespondToLeaveRequestAsync(int supervisorId, int teamMemberId, bool isApproved)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.Id == teamMemberId && tm.Team.SupervisorId == supervisorId);

            if (teamMember == null) return false;
            if (!teamMember.HasRequestedLeave) return false;

            if (isApproved)
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

                var remainingMembers = await _context.TeamMembers
                    .CountAsync(tm => tm.TeamId == teamId && tm.Id != teamMemberId);

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

        // Get all available teams
        public async Task<List<AvailableTeamDto>> GetAvailableTeamsAsync()
        {
            return await _context.Teams
                .Where(t => t.Status == "Pending" || t.Status == "Active")
                .Select(t => new AvailableTeamDto
                {
                    Id = t.Id,
                    ProjectTitle = t.ProjectTitle,
                    SupervisorName = t.Supervisor.UserProfile != null
                        ? t.Supervisor.UserProfile.FullName
                        : t.Supervisor.Username,
                    MembersCount = t.TeamMembers.Count,
                    RemainingSlots = 4 - t.TeamMembers.Count
                })
                .Where(t => t.RemainingSlots > 0)
                .ToListAsync();
        }

        // Student requests to join a team
        public async Task<bool> RequestToJoinTeamAsync(int studentId, JoinTeamRequestDto dto)
        {
            var existingMember = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == studentId);

            if (existingMember) return false;

            var existingRequest = await _context.TeamJoinRequests
                .AnyAsync(jr => jr.TeamId == dto.TeamId && jr.StudentId == studentId && jr.Status == "Pending");

            if (existingRequest) return false;

            var memberCount = await _context.TeamMembers
                .CountAsync(tm => tm.TeamId == dto.TeamId);

            if (memberCount >= 4) return false;

            _context.TeamJoinRequests.Add(new TeamJoinRequest
            {
                TeamId = dto.TeamId,
                StudentId = studentId,
                Status = "Pending",
                RequestType = "Request",
                SentAt = DateTime.UtcNow
            });

            var teamMembers = await _context.TeamMembers
                .Where(tm => tm.TeamId == dto.TeamId)
                .ToListAsync();

            foreach (var member in teamMembers)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "New Join Request",
                    Message = "A student has requested to join your team.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Team member responds to student's join request
        public async Task<bool> RespondToStudentRequestAsync(int memberId, RespondToJoinRequestDto dto)
        {
            var joinRequest = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == dto.JoinRequestId && jr.RequestType == "Request");

            if (joinRequest == null) return false;

            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == joinRequest.TeamId && tm.UserId == memberId);

            if (!isMember) return false;

            if (dto.IsAccepted)
            {
                joinRequest.Status = "Accepted";

                _context.TeamMembers.Add(new TeamMember
                {
                    TeamId = joinRequest.TeamId,
                    UserId = joinRequest.StudentId
                });

                _context.Notifications.Add(new Notification
                {
                    Title = "Join Request Accepted",
                    Message = "Your request to join the team has been accepted.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = joinRequest.StudentId
                });
            }
            else
            {
                joinRequest.Status = "Rejected";

                _context.Notifications.Add(new Notification
                {
                    Title = "Join Request Rejected",
                    Message = "Your request to join the team has been rejected.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = joinRequest.StudentId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Get all supervisors
        public async Task<List<TeamMemberDto>> GetAllSupervisorsAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "Supervisor")
                .Select(u => new TeamMemberDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.UserProfile != null ? u.UserProfile.FullName : ""
                })
                .ToListAsync();
        }
    }
}