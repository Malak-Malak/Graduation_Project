using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Student;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class StudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }
        //Get all available students
        public async Task<List<AvailableStudentDto>> GetAvailableStudentsAsync()
        {
            var studentsInTeams = await _context.TeamMembers
                .Select(tm => tm.UserId)
                .ToListAsync();

            return await _context.Users
                .Where(u => u.Role == "Student" && !studentsInTeams.Contains(u.Id))
                .Select(u => new AvailableStudentDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.UserProfile != null ? u.UserProfile.FullName : u.Username,
                    Field = u.UserProfile != null ? u.UserProfile.Field : null 
                })
                .ToListAsync();
        }

        // Get all supervisors
        public async Task<List<SupervisorDto>> GetAllSupervisorsAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "Supervisor")
                .Select(u => new SupervisorDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.UserProfile != null ? u.UserProfile.FullName : u.Username
                })
                .ToListAsync();
        }
        // GET all available teams with there memebers
        public async Task<List<AvailableTeamDto>> GetAvailableTeamsAsync()
        {
            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Include(t => t.Project)
                .Where(t => t.Status == "Pending" || t.Status == "Active")
                .ToListAsync();

            return teams
                .Where(t => t.TeamMembers.Count < 4)
                .Select(t => new AvailableTeamDto
                {
                    Id = t.Id,
                    ProjectTitle = t.ProjectTitle,
                    ProjectDescription = t.Project != null ? t.Project.Description : "",
                    SupervisorName = t.Supervisor.UserProfile != null
                        ? t.Supervisor.UserProfile.FullName
                        : t.Supervisor.Username,
                    MembersCount = t.TeamMembers.Count,
                    RemainingSlots = 4 - t.TeamMembers.Count,
                    MemberNames = t.TeamMembers
                        .Select(tm => tm.User.UserProfile != null
                            ? tm.User.UserProfile.FullName
                            : tm.User.Username)
                        .ToList()
                })
                .ToList();
        }
        //GET all the students (either in team or not) 
        public async Task<List<AvailableStudentDto>> GetAllStudentsAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "Student")
                .Select(u => new AvailableStudentDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.UserProfile != null ? u.UserProfile.FullName : u.Username,
                    Field = u.UserProfile != null ? u.UserProfile.Field : null
                })
                .ToListAsync();
        }


        // Get my team
        public async Task<StudentTeamDto?> GetMyTeamAsync(int studentId)
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

            return new StudentTeamDto
            {
                Id = team.Id,
                ProjectTitle = team.ProjectTitle,
                Status = team.Status,
                SupervisorName = team.Supervisor.UserProfile != null
                    ? team.Supervisor.UserProfile.FullName
                    : team.Supervisor.Username,
                Members = team.TeamMembers.Select(tm => new StudentMemberDto
                {
                    UserId = tm.UserId,
                    Username = tm.User.Username,
                    FullName = tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username
                }).ToList()
            };
        }

        // Create a team
        public async Task<bool> CreateTeamAsync(int studentId, CreateTeamDto dto)
        {
            // Check if student is already in a team
            var existingMember = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == studentId);

            if (existingMember) return false;

            // Check if student already has a pending team
            var existingTeam = await _context.Teams
                .AnyAsync(t => t.CreatedByUserId == studentId && t.Status == "Pending");

            if (existingTeam) return false;

            // Check supervisor exists
            var supervisor = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.SupervisorId && u.Role == "Supervisor");

            if (supervisor == null) return false;

            var team = new Team
            {
                ProjectTitle = dto.ProjectTitle,
                SupervisorId = dto.SupervisorId,
                CreatedByUserId = studentId,
                Status = "Pending"
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            // Add creator as first member
            _context.TeamMembers.Add(new TeamMember
            {
                TeamId = team.Id,
                UserId = studentId
            });

            // Send invitations to optional students
            if (dto.StudentIds != null && dto.StudentIds.Any())
            {
                foreach (var sid in dto.StudentIds)
                {
                    if (sid == studentId) continue;

                    var alreadyInTeam = await _context.TeamMembers
                        .AnyAsync(tm => tm.UserId == sid);

                    if (alreadyInTeam) continue;

                    var studentExists = await _context.Users
                        .AnyAsync(u => u.Id == sid && u.Role == "Student");

                    if (!studentExists) continue;

                    _context.TeamJoinRequests.Add(new TeamJoinRequest
                    {
                        TeamId = team.Id,
                        StudentId = sid,
                        Status = "Pending",
                        RequestType = "Invitation",
                        SentAt = DateTime.UtcNow
                    });

                    _context.Notifications.Add(new Notification
                    {
                        Title = "Team Invitation",
                        Message = $"You have been invited to join team: {dto.ProjectTitle}",
                        CreatedAt = DateTime.UtcNow,
                        UserId = sid
                    });
                }
            }

            // Notify supervisor
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

        // Send invitation to a student
        public async Task<bool> SendInvitationAsync(int senderId, SendInvitationDto dto)
        {
            // Check sender is in a team
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

            // Check student exists and is not in a team
            var studentExists = await _context.Users
                .AnyAsync(u => u.Id == dto.StudentId && u.Role == "Student");

            if (!studentExists) return false;

            var studentInTeam = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == dto.StudentId);

            if (studentInTeam) return false;

            // Check no pending invitation already exists
            var existingInvitation = await _context.TeamJoinRequests
                .AnyAsync(jr => jr.TeamId == team.Id
                    && jr.StudentId == dto.StudentId
                    && jr.Status == "Pending");

            if (existingInvitation) return false;

            _context.TeamJoinRequests.Add(new TeamJoinRequest
            {
                TeamId = team.Id,
                StudentId = dto.StudentId,
                Status = "Pending",
                RequestType = "Invitation",
                SentAt = DateTime.UtcNow
            });

            _context.Notifications.Add(new Notification
            {
                Title = "Team Invitation",
                Message = $"You have been invited to join team: {team.ProjectTitle}",
                CreatedAt = DateTime.UtcNow,
                UserId = dto.StudentId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Student requests to join a team
        public async Task<bool> RequestToJoinTeamAsync(int studentId, RequestToJoinDto dto)
        {
            // Check student is not already in a team
            var existingMember = await _context.TeamMembers
                .AnyAsync(tm => tm.UserId == studentId);

            if (existingMember) return false;

            // Check team exists and is not full
            var memberCount = await _context.TeamMembers
                .CountAsync(tm => tm.TeamId == dto.TeamId);

            if (memberCount >= 4) return false;

            // Check no pending request already exists
            var existingRequest = await _context.TeamJoinRequests
                .AnyAsync(jr => jr.TeamId == dto.TeamId
                    && jr.StudentId == studentId
                    && jr.Status == "Pending");

            if (existingRequest) return false;

            _context.TeamJoinRequests.Add(new TeamJoinRequest
            {
                TeamId = dto.TeamId,
                StudentId = studentId,
                Status = "Pending",
                RequestType = "Request",
                SentAt = DateTime.UtcNow
            });

            // Notify all team members
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

        // Student responds to an invitation
        public async Task<bool> RespondToInvitationAsync(int studentId, RespondToInvitationDto dto)
        {
            var invitation = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == dto.JoinRequestId
                    && jr.StudentId == studentId
                    && jr.RequestType == "Invitation"
                    && jr.Status == "Pending");

            if (invitation == null) return false;

            if (dto.IsAccepted)
            {
                // Check team is not full
                var memberCount = await _context.TeamMembers
                    .CountAsync(tm => tm.TeamId == invitation.TeamId);

                if (memberCount >= 4) return false;

                invitation.Status = "Accepted";

                _context.TeamMembers.Add(new TeamMember
                {
                    TeamId = invitation.TeamId,
                    UserId = studentId
                });

                // Notify team members
                var teamMembers = await _context.TeamMembers
                    .Where(tm => tm.TeamId == invitation.TeamId)
                    .ToListAsync();

                foreach (var member in teamMembers)
                {
                    _context.Notifications.Add(new Notification
                    {
                        Title = "Student Joined",
                        Message = "A student has accepted your invitation and joined the team.",
                        CreatedAt = DateTime.UtcNow,
                        UserId = member.UserId
                    });
                }
            }
            else
            {
                invitation.Status = "Rejected";
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Student responds to a join request (team member accepts/rejects student request)
        public async Task<bool> RespondToJoinRequestAsync(int memberId, RespondToInvitationDto dto)
        {
            var joinRequest = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == dto.JoinRequestId
                    && jr.RequestType == "Request"
                    && jr.Status == "Pending");

            if (joinRequest == null) return false;

            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == joinRequest.TeamId && tm.UserId == memberId);

            if (!isMember) return false;

            if (dto.IsAccepted)
            {
                var memberCount = await _context.TeamMembers
                    .CountAsync(tm => tm.TeamId == joinRequest.TeamId);

                if (memberCount >= 4) return false;

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
        // Get my pending invitations
        public async Task<List<InvitationDto>> GetMyInvitationsAsync(int studentId)
        {
            return await _context.TeamJoinRequests
                .Include(jr => jr.Team)
                .Where(jr => jr.StudentId == studentId
                    && jr.RequestType == "Invitation"
                    && jr.Status == "Pending")
                .Select(jr => new InvitationDto
                {
                    Id = jr.Id,
                    TeamName = jr.Team.ProjectTitle,
                    Status = jr.Status,
                    SentAt = jr.SentAt
                })
                .ToListAsync();
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

            if (team == null) return false;

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
        public async Task<bool> UpdateProjectInfoAsync(int studentId, UpdateProjectInfoDto dto)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == studentId);

            if (teamMember == null) return false;

            var team = await _context.Teams
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == teamMember.TeamId);

            if (team == null) return false;

            if (team.Project == null)
            {
                // Create new project
                var project = new Project
                {
                    Title = dto.ProjectTitle,
                    Description = dto.ProjectDescription ?? "",
                    StartDate = DateTime.UtcNow,
                    Status = true,
                    SupervisorId = team.SupervisorId
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                team.ProjectId = project.Id;
                team.ProjectTitle = dto.ProjectTitle;
            }
            else
            {
                // Update existing project
                team.Project.Title = dto.ProjectTitle;
                team.Project.Description = dto.ProjectDescription ?? "";
                team.ProjectTitle = dto.ProjectTitle;
            }

            await _context.SaveChangesAsync();
            return true;
        }
        // Get my requests to join teams
        public async Task<List<MyJoinRequestDto>> GetMyJoinRequestsAsync(int studentId)
        {
            return await _context.TeamJoinRequests
                .Include(jr => jr.Team)
                .Where(jr => jr.StudentId == studentId && jr.RequestType == "Request")
                .Select(jr => new MyJoinRequestDto
                {
                    Id = jr.Id,
                    TeamId = jr.TeamId,
                    TeamName = jr.Team.ProjectTitle,
                    Status = jr.Status,
                    SentAt = jr.SentAt
                })
                .ToListAsync();
        }

        // Get join requests for my team
        public async Task<List<TeamJoinRequestDto>> GetTeamJoinRequestsAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == studentId);

            if (teamMember == null) return new List<TeamJoinRequestDto>();

            return await _context.TeamJoinRequests
                .Include(jr => jr.Student)
                    .ThenInclude(s => s.UserProfile)
                .Where(jr => jr.TeamId == teamMember.TeamId
                    && jr.RequestType == "Request"
                    && jr.Status == "Pending")
                .Select(jr => new TeamJoinRequestDto
                {
                    Id = jr.Id,
                    StudentId = jr.StudentId,
                    Username = jr.Student.Username,
                    FullName = jr.Student.UserProfile != null
                        ? jr.Student.UserProfile.FullName
                        : jr.Student.Username,
                    SentAt = jr.SentAt
                })
                .ToListAsync();
        }

        // Delete my join request
        public async Task<bool> DeleteMyJoinRequestAsync(int studentId, int requestId)
        {
            var request = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == requestId
                    && jr.StudentId == studentId
                    && jr.RequestType == "Request");

            if (request == null) return false;

            _context.TeamJoinRequests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }

        // Reject join request
        public async Task<bool> RejectJoinRequestAsync(int memberId, int requestId)
        {
            var joinRequest = await _context.TeamJoinRequests
                .FirstOrDefaultAsync(jr => jr.Id == requestId
                    && jr.RequestType == "Request"
                    && jr.Status == "Pending");

            if (joinRequest == null) return false;

            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == joinRequest.TeamId && tm.UserId == memberId);

            if (!isMember) return false;

            joinRequest.Status = "Rejected";

            _context.Notifications.Add(new Notification
            {
                Title = "Join Request Rejected",
                Message = "Your request to join the team has been rejected.",
                CreatedAt = DateTime.UtcNow,
                UserId = joinRequest.StudentId
            });

            await _context.SaveChangesAsync();
            return true;
        }
    }
}