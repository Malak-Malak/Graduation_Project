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
            // Check if student is already in a team
            var existingMember = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == studentId);

            if (existingMember) return false;

            // Check if student already created a pending team
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

            // Add creator as first team member
            var teamMember = new TeamMember
            {
                TeamId = team.Id,
                UserId = studentId
            };

            _context.TeamMembers.Add(teamMember);

            // Notify supervisor
            var notification = new Notification
            {
                Title = "New Team Request",
                Message = $"A student has requested you to supervise their team: {dto.ProjectTitle}",
                CreatedAt = DateTime.UtcNow,
                UserId = dto.SupervisorId
            };

            _context.Notifications.Add(notification);
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

        // Send join request to a student
        public async Task<bool> SendJoinRequestAsync(int senderId, SendJoinRequestDto dto)
        {
            // Check if sender is in a team
            var senderMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == senderId);

            if (senderMember == null) return false;

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == senderMember.TeamId);

            if (team == null) return false;

            // Check team is not full
            var memberCount = await _context.TeamMembers
                .CountAsync(tm => tm.TeamId == team.Id);

            if (memberCount >= 4) return false;

            // Check if student already has a pending request from this team
            var existingRequest = await _context.TeamJoinRequests
                .AnyAsync(jr => jr.TeamId == team.Id && jr.StudentId == dto.StudentId && jr.Status == "Pending");

            if (existingRequest) return false;

            // Check if student is already in a team
            var studentInTeam = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == dto.StudentId);

            if (studentInTeam) return false;

            var joinRequest = new TeamJoinRequest
            {
                TeamId = team.Id,
                StudentId = dto.StudentId,
                Status = "Pending",
                SentAt = DateTime.UtcNow
            };

            _context.TeamJoinRequests.Add(joinRequest);

            // Notify student
            var notification = new Notification
            {
                Title = "Team Join Request",
                Message = $"You have been invited to join team: {team.ProjectTitle}",
                CreatedAt = DateTime.UtcNow,
                UserId = dto.StudentId
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        // Student responds to join request
        public async Task<bool> RespondToJoinRequestAsync(int studentId, RespondToJoinRequestDto dto)
        {
            var joinRequest = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == dto.JoinRequestId && jr.StudentId == studentId);

            if (joinRequest == null) return false;

            if (dto.IsAccepted)
            {
                joinRequest.Status = "Accepted";

                var teamMember = new TeamMember
                {
                    TeamId = joinRequest.TeamId,
                    UserId = studentId
                };

                _context.TeamMembers.Add(teamMember);
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

        // Leave team
        public async Task<bool> LeaveTeamAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == studentId);

            if (teamMember == null) return false;

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == teamMember.TeamId);

            _context.TeamMembers.Remove(teamMember);

            // Check if team has no members left → disband
            var remainingMembers = await _context.TeamMembers
                .CountAsync(tm => tm.TeamId == teamMember.TeamId && tm.UserId != studentId);

            if (remainingMembers == 0)
            {
                _context.Teams.Remove(team);
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}