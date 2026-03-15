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
                team.Status = "Active";

                // Notify all team members
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

                // Notify all team members
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
    }
}