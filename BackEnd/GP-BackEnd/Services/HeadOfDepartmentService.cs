using GP_BackEnd.Data;
using GP_BackEnd.DTOs.HeadOfDepartment;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class HeadOfDepartmentService
    {
        private readonly ApplicationDbContext _context;

        public HeadOfDepartmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper: get department of head
        private async Task<string?> GetDepartmentAsync(int userId)
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            return profile?.Department;
        }

        // Helper: check if user is head of department
        private async Task<bool> IsHeadOfDepartmentAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user != null && user.IsHeadOfDepartment;
        }

        // Create a discussion slot
        public async Task<bool> CreateSlotAsync(int headId, CreateDiscussionSlotDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return false;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return false;

            _context.DiscussionSlots.Add(new DiscussionSlot
            {
                DateTime = dto.DateTime,
                Location = dto.Location,
                Notes = dto.Notes,
                HeadOfDepartmentId = headId,
                Department = department
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Delete a discussion slot
        public async Task<bool> DeleteSlotAsync(int headId, int slotId)
        {
            var slot = await _context.DiscussionSlots
                .FirstOrDefaultAsync(ds => ds.Id == slotId && ds.HeadOfDepartmentId == headId);

            if (slot == null) return false;

            _context.DiscussionSlots.Remove(slot);
            await _context.SaveChangesAsync();
            return true;
        }

        // Get all slots created by head
        public async Task<List<DiscussionSlotDto>> GetMySlotsAsync(int headId)
        {
            var slots = await _context.DiscussionSlots
                .Include(ds => ds.TeamSlots)
                    .ThenInclude(ts => ts.Team)
                        .ThenInclude(t => t.TeamMembers)
                            .ThenInclude(tm => tm.User)
                                .ThenInclude(u => u.UserProfile)
                .Where(ds => ds.HeadOfDepartmentId == headId)
                .OrderBy(ds => ds.DateTime)
                .ToListAsync();

            return slots.Select(ds => new DiscussionSlotDto
            {
                Id = ds.Id,
                DateTime = ds.DateTime,
                Location = ds.Location,
                Notes = ds.Notes,
                Department = ds.Department,
                AssignedTeams = ds.TeamSlots.Select(ts => new AssignedTeamDto
                {
                    TeamId = ts.TeamId,
                    ProjectName = ts.Team.ProjectTitle,
                    MemberNames = ts.Team.TeamMembers
                        .Select(tm => tm.User.UserProfile != null
                            ? tm.User.UserProfile.FullName
                            : tm.User.Username)
                        .ToList()
                }).ToList()
            }).ToList();
        }

        // Assign team to slot
        public async Task<bool> AssignTeamToSlotAsync(int headId, AssignTeamToSlotDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return false;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return false;

            // Check slot belongs to this head
            var slot = await _context.DiscussionSlots
                .FirstOrDefaultAsync(ds => ds.Id == dto.SlotId && ds.HeadOfDepartmentId == headId);

            if (slot == null) return false;

            // Check team is in the same department
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId);

            if (team == null) return false;

            var teamDepartment = team.TeamMembers
                .Select(tm => tm.User.UserProfile?.Department)
                .FirstOrDefault();

            if (teamDepartment != department) return false;

            // Check team not already assigned to a slot
            var existingAssignment = await _context.TeamDiscussionSlots
                .AnyAsync(tds => tds.TeamId == dto.TeamId);

            if (existingAssignment) return false;

            _context.TeamDiscussionSlots.Add(new TeamDiscussionSlot
            {
                TeamId = dto.TeamId,
                DiscussionSlotId = dto.SlotId
            });

            // Notify team members
            foreach (var member in team.TeamMembers)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "Discussion Slot Assigned",
                    Message = $"Your team has been assigned a final discussion slot on {slot.DateTime:ddd dd MMM} at {slot.DateTime:hh\\:mm tt} at {slot.Location}.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            // Notify supervisor
            _context.Notifications.Add(new Notification
            {
                Title = "Discussion Slot Assigned",
                Message = $"Team '{team.ProjectTitle}' has been assigned a final discussion slot on {slot.DateTime:ddd dd MMM}.",
                CreatedAt = DateTime.UtcNow,
                UserId = team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Get all teams in department
        public async Task<List<DepartmentTeamDto>> GetDepartmentTeamsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return new List<DepartmentTeamDto>();

            var department = await GetDepartmentAsync(headId);
            if (department == null) return new List<DepartmentTeamDto>();

            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .ToListAsync();

            var departmentTeams = teams.Where(t => t.TeamMembers
                .Any(tm => tm.User.UserProfile?.Department == department))
                .ToList();

            var teamIds = departmentTeams.Select(t => t.Id).ToList();

            var assignments = await _context.TeamDiscussionSlots
                .Include(tds => tds.DiscussionSlot)
                .Where(tds => teamIds.Contains(tds.TeamId))
                .ToListAsync();

            return departmentTeams.Select(t =>
            {
                var assignment = assignments.FirstOrDefault(a => a.TeamId == t.Id);
                return new DepartmentTeamDto
                {
                    TeamId = t.Id,
                    ProjectName = t.ProjectTitle,
                    Status = t.Status,
                    SupervisorName = t.Supervisor.UserProfile != null
                        ? t.Supervisor.UserProfile.FullName
                        : t.Supervisor.Username,
                    MemberNames = t.TeamMembers
                        .Select(tm => tm.User.UserProfile != null
                            ? tm.User.UserProfile.FullName
                            : tm.User.Username)
                        .ToList(),
                    AssignedSlot = assignment != null ? new DiscussionSlotDto
                    {
                        Id = assignment.DiscussionSlot.Id,
                        DateTime = assignment.DiscussionSlot.DateTime,
                        Location = assignment.DiscussionSlot.Location,
                        Notes = assignment.DiscussionSlot.Notes,
                        Department = assignment.DiscussionSlot.Department
                    } : null
                };
            }).ToList();
        }

        // Get all supervisors in department with their teams
        public async Task<List<DepartmentSupervisorDto>> GetDepartmentSupervisorsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return new List<DepartmentSupervisorDto>();

            var department = await GetDepartmentAsync(headId);
            if (department == null) return new List<DepartmentSupervisorDto>();

            var supervisors = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.SupervisedTeams)
                    .ThenInclude(t => t.TeamMembers)
                        .ThenInclude(tm => tm.User)
                            .ThenInclude(u => u.UserProfile)
                .Where(u => u.Role == "Supervisor"
                    && u.UserProfile != null
                    && u.UserProfile.Department == department)
                .ToListAsync();

            return supervisors.Select(s => new DepartmentSupervisorDto
            {
                UserId = s.Id,
                Username = s.Username,
                FullName = s.UserProfile != null ? s.UserProfile.FullName : s.Username,
                Teams = s.SupervisedTeams.Select(t => new DepartmentTeamDto
                {
                    TeamId = t.Id,
                    ProjectName = t.ProjectTitle,
                    Status = t.Status,
                    SupervisorName = s.UserProfile != null ? s.UserProfile.FullName : s.Username,
                    MemberNames = t.TeamMembers
                        .Select(tm => tm.User.UserProfile != null
                            ? tm.User.UserProfile.FullName
                            : tm.User.Username)
                        .ToList()
                }).ToList()
            }).ToList();
        }

        // Get student registration requests in department
        public async Task<List<DTOs.Admin.RegistrationRequestDto>> GetDepartmentStudentRequestsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return new List<DTOs.Admin.RegistrationRequestDto>();

            var department = await GetDepartmentAsync(headId);
            if (department == null) return new List<DTOs.Admin.RegistrationRequestDto>();

            return await _context.RegistrationRequests
                .Where(r => r.Status == "Pending")
                .Join(_context.UniversityRecords,
                    r => r.UniversityEmail,
                    u => u.UniversityEmail,
                    (r, u) => new { Request = r, Record = u })
                .Where(x => x.Record.Role == "Student" && x.Record.Department == department)
                .Select(x => new DTOs.Admin.RegistrationRequestDto
                {
                    Id = x.Request.Id,
                    UniversityEmail = x.Request.UniversityEmail,
                    Status = x.Request.Status,
                    RequestedAt = x.Request.RequestedAt
                })
                .ToListAsync();
        }

        // Review student request
        public async Task<bool> ReviewStudentRequestAsync(int headId, DTOs.Admin.ApproveRequestDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return false;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return false;

            var request = await _context.RegistrationRequests
                .FirstOrDefaultAsync(r => r.Id == dto.RequestId);

            if (request == null) return false;

            // Verify student is in head's department
            var universityRecord = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == request.UniversityEmail
                    && u.Role == "Student"
                    && u.Department == department);

            if (universityRecord == null) return false;

            if (dto.IsApproved)
            {
                var user = new User
                {
                    Username = universityRecord.Username,
                    Email = universityRecord.UniversityEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(universityRecord.Password),
                    Role = "Student",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                request.Status = "Approved";
            }
            else
            {
                request.Status = "Rejected";
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Get all students in department
        public async Task<List<DepartmentStudentDto>> GetDepartmentStudentsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return new List<DepartmentStudentDto>();

            var department = await GetDepartmentAsync(headId);
            if (department == null) return new List<DepartmentStudentDto>();

            var students = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.TeamMembers)
                    .ThenInclude(tm => tm.Team)
                .Where(u => u.Role == "Student"
                    && u.UserProfile != null
                    && u.UserProfile.Department == department)
                .ToListAsync();

            return students.Select(s => new DepartmentStudentDto
            {
                UserId = s.Id,
                Username = s.Username,
                FullName = s.UserProfile != null ? s.UserProfile.FullName : s.Username,
                IsInTeam = s.TeamMembers.Any(),
                TeamName = s.TeamMembers.FirstOrDefault()?.Team?.ProjectTitle
            }).ToList();
        }

        // Student gets their discussion slot
        public async Task<MyDiscussionSlotDto?> GetMyDiscussionSlotAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == studentId);

            if (teamMember == null) return null;

            var assignment = await _context.TeamDiscussionSlots
                .Include(tds => tds.DiscussionSlot)
                .Include(tds => tds.Team)
                .FirstOrDefaultAsync(tds => tds.TeamId == teamMember.TeamId);

            if (assignment == null) return null;

            return new MyDiscussionSlotDto
            {
                SlotId = assignment.DiscussionSlot.Id,
                DateTime = assignment.DiscussionSlot.DateTime,
                Location = assignment.DiscussionSlot.Location,
                Notes = assignment.DiscussionSlot.Notes,
                TeamName = assignment.Team.ProjectTitle
            };
        }

        // Supervisor gets all their teams slots
        public async Task<List<DepartmentTeamDto>> GetSupervisorTeamsSlotsAsync(int supervisorId)
        {
            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Where(t => t.SupervisorId == supervisorId)
                .ToListAsync();

            var teamIds = teams.Select(t => t.Id).ToList();

            var assignments = await _context.TeamDiscussionSlots
                .Include(tds => tds.DiscussionSlot)
                .Where(tds => teamIds.Contains(tds.TeamId))
                .ToListAsync();

            return teams.Select(t =>
            {
                var assignment = assignments.FirstOrDefault(a => a.TeamId == t.Id);
                return new DepartmentTeamDto
                {
                    TeamId = t.Id,
                    ProjectName = t.ProjectTitle,
                    Status = t.Status,
                    SupervisorName = t.Supervisor.UserProfile != null
                        ? t.Supervisor.UserProfile.FullName
                        : t.Supervisor.Username,
                    MemberNames = t.TeamMembers
                        .Select(tm => tm.User.UserProfile != null
                            ? tm.User.UserProfile.FullName
                            : tm.User.Username)
                        .ToList(),
                    AssignedSlot = assignment != null ? new DiscussionSlotDto
                    {
                        Id = assignment.DiscussionSlot.Id,
                        DateTime = assignment.DiscussionSlot.DateTime,
                        Location = assignment.DiscussionSlot.Location,
                        Notes = assignment.DiscussionSlot.Notes,
                        Department = assignment.DiscussionSlot.Department
                    } : null
                };
            }).ToList();
        }
    }
}