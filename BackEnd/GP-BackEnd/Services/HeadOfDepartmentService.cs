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

        // ── Helpers ─────────────────────────────────────────────────────────

        private async Task<bool> IsHeadOfDepartmentAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user != null && user.IsHeadOfDepartment;
        }

        private async Task<string?> GetDepartmentAsync(int userId)
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            return profile?.Department;
        }

        // ── Discussion Slots ─────────────────────────────────────────────────

        // Create a discussion slot
        public async Task<(bool success, string message)> CreateSlotAsync(int headId, CreateDiscussionSlotDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId))
                return (false, "You are not a head of department.");

            var department = await GetDepartmentAsync(headId);
            if (department == null)
                return (false, "No department set in your profile.");

            // No duplicate slot at same date and time in this department
            var duplicate = await _context.DiscussionSlots
                .AnyAsync(ds => ds.Department == department && ds.DateTime == dto.DateTime);
            if (duplicate)
                return (false, "A slot already exists at this exact date and time.");

            // Max 6 slots per day in this department
            var slotsOnSameDay = await _context.DiscussionSlots
                .CountAsync(ds => ds.Department == department
                    && ds.DateTime.Date == dto.DateTime.Date);
            if (slotsOnSameDay >= 6)
                return (false, "Maximum of 6 discussion slots are allowed per day.");

            _context.DiscussionSlots.Add(new DiscussionSlot
            {
                DateTime = dto.DateTime,
                Location = dto.Location,
                Notes = dto.Notes,
                HeadOfDepartmentId = headId,
                Department = department
            });

            await _context.SaveChangesAsync();
            return (true, "Discussion slot created successfully.");
        }

        // Delete a discussion slot
        public async Task<(bool success, string message)> DeleteSlotAsync(int headId, int slotId)
        {
            if (!await IsHeadOfDepartmentAsync(headId))
                return (false, "You are not a head of department.");

            var slot = await _context.DiscussionSlots
                .FirstOrDefaultAsync(ds => ds.Id == slotId && ds.HeadOfDepartmentId == headId);

            if (slot == null)
                return (false, "Slot not found or does not belong to you.");

            _context.DiscussionSlots.Remove(slot);
            await _context.SaveChangesAsync();
            return (true, "Discussion slot deleted successfully.");
        }

        // Get all slots created by this HOD
        public async Task<List<DiscussionSlotDto>?> GetMySlotsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return null;

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

        // ── Team-Slot Assignment ─────────────────────────────────────────────

        // Assign a team to a slot
        public async Task<(bool success, string message)> AssignTeamToSlotAsync(int headId, AssignTeamToSlotDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId))
                return (false, "You are not a head of department.");

            var department = await GetDepartmentAsync(headId);
            if (department == null)
                return (false, "No department set in your profile.");

            // Slot must belong to this HOD
            var slot = await _context.DiscussionSlots
                .FirstOrDefaultAsync(ds => ds.Id == dto.SlotId && ds.HeadOfDepartmentId == headId);
            if (slot == null)
                return (false, "Slot not found or does not belong to you.");

            // Slot must not already be taken by another team
            var slotTaken = await _context.TeamDiscussionSlots
                .AnyAsync(tds => tds.DiscussionSlotId == dto.SlotId);
            if (slotTaken)
                return (false, "This slot is already assigned to another team.");

            // Team must exist, be Active, and belong to HOD's department (via supervisor)
            var team = await _context.Teams
                .Include(t => t.Supervisor).ThenInclude(s => s.UserProfile)
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId);

            if (team == null)
                return (false, "Team not found.");
            if (team.Status != "Active")
                return (false, "Only active teams can be assigned a discussion slot.");
            if (team.Supervisor.UserProfile?.Department != department)
                return (false, "Team does not belong to your department.");

            // If team already has a slot, remove old assignment first
            var existingAssignment = await _context.TeamDiscussionSlots
                .FirstOrDefaultAsync(tds => tds.TeamId == dto.TeamId);
            if (existingAssignment != null)
                _context.TeamDiscussionSlots.Remove(existingAssignment);

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
                Message = $"Team '{team.ProjectTitle}' has been assigned a final discussion slot on {slot.DateTime:ddd dd MMM} at {slot.DateTime:hh\\:mm tt}.",
                CreatedAt = DateTime.UtcNow,
                UserId = team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return (true, "Team assigned to slot successfully.");
        }

        // Reassign a team to a different slot
        public async Task<(bool success, string message)> UpdateTeamSlotAsync(int headId, UpdateTeamSlotDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId))
                return (false, "You are not a head of department.");

            var department = await GetDepartmentAsync(headId);
            if (department == null)
                return (false, "No department set in your profile.");

            // New slot must exist and belong to this HOD
            var newSlot = await _context.DiscussionSlots
                .FirstOrDefaultAsync(ds => ds.Id == dto.NewSlotId && ds.HeadOfDepartmentId == headId);
            if (newSlot == null)
                return (false, "New slot not found or does not belong to you.");

            // New slot must not be taken by a different team
            var newSlotTaken = await _context.TeamDiscussionSlots
                .AnyAsync(tds => tds.DiscussionSlotId == dto.NewSlotId && tds.TeamId != dto.TeamId);
            if (newSlotTaken)
                return (false, "The new slot is already assigned to another team.");

            // Team must exist, be Active, and belong to HOD's department
            var team = await _context.Teams
                .Include(t => t.Supervisor).ThenInclude(s => s.UserProfile)
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId);

            if (team == null)
                return (false, "Team not found.");
            if (team.Status != "Active")
                return (false, "Only active teams can have a discussion slot.");
            if (team.Supervisor.UserProfile?.Department != department)
                return (false, "Team does not belong to your department.");

            // Remove old assignment
            var existing = await _context.TeamDiscussionSlots
                .FirstOrDefaultAsync(tds => tds.TeamId == dto.TeamId);
            if (existing != null)
                _context.TeamDiscussionSlots.Remove(existing);

            // Add new assignment
            _context.TeamDiscussionSlots.Add(new TeamDiscussionSlot
            {
                TeamId = dto.TeamId,
                DiscussionSlotId = dto.NewSlotId
            });

            // Notify team members
            foreach (var member in team.TeamMembers)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "Discussion Slot Updated",
                    Message = $"Your team's discussion slot has been changed to {newSlot.DateTime:ddd dd MMM} at {newSlot.DateTime:hh\\:mm tt} at {newSlot.Location}.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            // Notify supervisor
            _context.Notifications.Add(new Notification
            {
                Title = "Discussion Slot Updated",
                Message = $"Team '{team.ProjectTitle}' discussion slot has been updated to {newSlot.DateTime:ddd dd MMM} at {newSlot.DateTime:hh\\:mm tt}.",
                CreatedAt = DateTime.UtcNow,
                UserId = team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return (true, "Team slot updated successfully.");
        }

        // Unassign a team from its slot
        public async Task<(bool success, string message)> UnassignTeamFromSlotAsync(int headId, int teamId)
        {
            if (!await IsHeadOfDepartmentAsync(headId))
                return (false, "You are not a head of department.");

            var department = await GetDepartmentAsync(headId);
            if (department == null)
                return (false, "No department set in your profile.");

            // Team must belong to HOD's department
            var team = await _context.Teams
                .Include(t => t.Supervisor).ThenInclude(s => s.UserProfile)
                .Include(t => t.TeamMembers)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
                return (false, "Team not found.");
            if (team.Supervisor.UserProfile?.Department != department)
                return (false, "Team does not belong to your department.");

            var assignment = await _context.TeamDiscussionSlots
                .Include(tds => tds.DiscussionSlot)
                .FirstOrDefaultAsync(tds => tds.TeamId == teamId);

            if (assignment == null)
                return (false, "This team has no assigned slot.");

            _context.TeamDiscussionSlots.Remove(assignment);

            // Notify team members
            foreach (var member in team.TeamMembers)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "Discussion Slot Removed",
                    Message = "Your team's discussion slot has been removed.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            // Notify supervisor
            _context.Notifications.Add(new Notification
            {
                Title = "Discussion Slot Removed",
                Message = $"Team '{team.ProjectTitle}' has had their discussion slot removed.",
                CreatedAt = DateTime.UtcNow,
                UserId = team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return (true, "Team unassigned from slot successfully.");
        }

        // ── Department Views ─────────────────────────────────────────────────

        // Get all teams in HOD's department (filtered by supervisor's department)
        public async Task<List<DepartmentTeamDto>?> GetDepartmentTeamsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return null;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return null;

            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Where(t => t.Supervisor.UserProfile != null
                    && t.Supervisor.UserProfile.Department == department)
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

        // Get all supervisors in HOD's department (excluding the HOD himself)
        public async Task<List<DepartmentSupervisorDto>?> GetDepartmentSupervisorsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return null;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return null;

            var supervisors = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.SupervisedTeams)
                    .ThenInclude(t => t.TeamMembers)
                        .ThenInclude(tm => tm.User)
                            .ThenInclude(u => u.UserProfile)
                .Where(u => u.Role == "Supervisor"
                    && u.Id != headId
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

        // ── Student Registration ─────────────────────────────────────────────

        // Get pending student registration requests in HOD's department
        public async Task<List<DTOs.Admin.RegistrationRequestDto>?> GetDepartmentStudentRequestsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return null;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return null;

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

        // Approve or reject a student registration request
        public async Task<(bool success, string message)> ReviewStudentRequestAsync(int headId, DTOs.Admin.ApproveRequestDto dto)
        {
            if (!await IsHeadOfDepartmentAsync(headId))
                return (false, "You are not a head of department.");

            var department = await GetDepartmentAsync(headId);
            if (department == null)
                return (false, "No department set in your profile.");

            var request = await _context.RegistrationRequests
                .FirstOrDefaultAsync(r => r.Id == dto.RequestId);
            if (request == null)
                return (false, "Request not found.");

            // Verify the student belongs to this HOD's department
            var universityRecord = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == request.UniversityEmail
                    && u.Role == "Student"
                    && u.Department == department);
            if (universityRecord == null)
                return (false, "Student does not belong to your department.");

            if (dto.IsApproved)
            {
                _context.Users.Add(new User
                {
                    Username = universityRecord.Username,
                    Email = universityRecord.UniversityEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(universityRecord.Password),
                    Role = "Student",
                    CreatedAt = DateTime.UtcNow
                });
                request.Status = "Approved";
            }
            else
            {
                request.Status = "Rejected";
            }

            await _context.SaveChangesAsync();
            return (true, dto.IsApproved ? "Student approved successfully." : "Request rejected.");
        }

        // Get all students in HOD's department
        public async Task<List<DepartmentStudentDto>?> GetDepartmentStudentsAsync(int headId)
        {
            if (!await IsHeadOfDepartmentAsync(headId)) return null;

            var department = await GetDepartmentAsync(headId);
            if (department == null) return null;

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

        // ── Student & Supervisor Views ────────────────────────────────────────

        // Student gets their own team's discussion slot
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

        // Supervisor gets all their teams with their assigned slots
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