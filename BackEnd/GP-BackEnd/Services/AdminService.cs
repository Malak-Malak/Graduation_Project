using BCrypt.Net;
using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Admin;
using GP_BackEnd.DTOs.User;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class AdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all pending requests
        public async Task<List<RegistrationRequestDto>> GetPendingRequestsAsync()
        {
            return await _context.RegistrationRequests
                .Where(r => r.Status == "Pending")
                .Select(r => new RegistrationRequestDto
                {
                    Id = r.Id,
                    UniversityEmail = r.UniversityEmail,
                    Status = r.Status,
                    RequestedAt = r.RequestedAt
                })
                .ToListAsync();
        }

        // Approve or reject a registration request
        public async Task<bool> ReviewRequestAsync(ApproveRequestDto dto)
        {
            var request = await _context.RegistrationRequests
                .FirstOrDefaultAsync(r => r.Id == dto.RequestId);

            if (request == null) return false;

            if (dto.IsApproved)
            {
                var universityRecord = await _context.UniversityRecords
                    .FirstOrDefaultAsync(u => u.UniversityEmail == request.UniversityEmail);

                if (universityRecord == null) return false;

                var user = new User
                {
                    Username = universityRecord.Username,
                    Email = universityRecord.UniversityEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(universityRecord.Password),
                    Role = char.ToUpper(universityRecord.Role[0]) + universityRecord.Role.Substring(1).ToLower(),
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

        // Add a single university record
        public async Task<bool> AddUniversityRecordAsync(AddUniversityRecordDto dto)
        {
            if (!dto.UniversityEmail.EndsWith("@students.ptuk.edu.ps"))
                return false;

            var existing = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == dto.UniversityEmail);

            if (existing != null) return false;

            _context.UniversityRecords.Add(new UniversityRecord
            {
                UniversityEmail = dto.UniversityEmail,
                Username = dto.Username,
                Password = dto.Password,
                FullName = dto.FullName,
                Role = dto.Role,
                Department = dto.Department,
                IsGraduate = dto.IsGraduate
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Get all users
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            var uniRecords = await _context.UniversityRecords.ToListAsync();

            return users.Select(u =>
            {
                var uniRecord = uniRecords
                    .FirstOrDefault(r => r.UniversityEmail == u.Email);

                return new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    Department = uniRecord?.Department,
                    CreatedAt = u.CreatedAt,
                    IsHeadOfDepartment = u.IsHeadOfDepartment,
                };
            }).ToList();
        }

        // Get all registration requests
        public async Task<List<RegistrationRequestDto>> GetAllRequestsAsync()
        {
            return await _context.RegistrationRequests
                .Select(r => new RegistrationRequestDto
                {
                    Id = r.Id,
                    UniversityEmail = r.UniversityEmail,
                    Status = r.Status,
                    RequestedAt = r.RequestedAt
                })
                .ToListAsync();
        }

        // Get all university records
        public async Task<List<UniversityRecordDto>> GetAllUniversityRecordsAsync()
        {
            return await _context.UniversityRecords
                .Select(r => new UniversityRecordDto
                {
                    Id = r.Id,
                    UniversityEmail = r.UniversityEmail,
                    Username = r.Username,
                    FullName = r.FullName,
                    Role = r.Role,
                    Department = r.Department,
                    IsGraduate = r.IsGraduate
                })
                .ToListAsync();
        }

        // Get specific university record by email
        public async Task<UniversityRecordDto?> GetUniversityRecordByEmailAsync(string email)
        {
            var record = await _context.UniversityRecords
                .FirstOrDefaultAsync(r => r.UniversityEmail == email);

            if (record == null) return null;

            return new UniversityRecordDto
            {
                Id = record.Id,
                UniversityEmail = record.UniversityEmail,
                Username = record.Username,
                FullName = record.FullName,
                Role = record.Role,
                Department = record.Department,
                IsGraduate = record.IsGraduate
            };
        }

        // Delete university record and its associated user
        public async Task<bool> DeleteUniversityRecordAsync(string universityEmail)
        {
            var record = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == universityEmail);

            if (record == null) return false;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == universityEmail);

            if (user != null)
                _context.Users.Remove(user);

            _context.UniversityRecords.Remove(record);
            await _context.SaveChangesAsync();
            return true;
        }

        //// Clear all data except admin account
        //public async Task<bool> ClearAllDataAsync()
        //{
        //    _context.TeamDiscussionSlots.RemoveRange(_context.TeamDiscussionSlots);
        //    _context.DiscussionSlots.RemoveRange(_context.DiscussionSlots);
        //    _context.TaskAssignments.RemoveRange(_context.TaskAssignments);
        //    _context.Feedbacks.RemoveRange(_context.Feedbacks);
        //    _context.TaskItems.RemoveRange(_context.TaskItems);
        //    _context.ProjectFiles.RemoveRange(_context.ProjectFiles);
        //    _context.Appointments.RemoveRange(_context.Appointments);
        //    _context.OfficeHours.RemoveRange(_context.OfficeHours);
        //    _context.TeamProgressReports.RemoveRange(_context.TeamProgressReports);
        //    _context.Requirements.RemoveRange(_context.Requirements);
        //    _context.TeamJoinRequests.RemoveRange(_context.TeamJoinRequests);
        //    _context.TeamMembers.RemoveRange(_context.TeamMembers);
        //    _context.Notifications.RemoveRange(_context.Notifications);
        //    _context.Teams.RemoveRange(_context.Teams);
        //    _context.Projects.RemoveRange(_context.Projects);
        //    _context.RegistrationRequests.RemoveRange(_context.RegistrationRequests);
        //    _context.UniversityRecords.RemoveRange(_context.UniversityRecords);
        //    _context.UserProfiles.RemoveRange(_context.UserProfiles);
        //    _context.ArchivedFiles.RemoveRange(_context.ArchivedFiles);
        //    await _context.SaveChangesAsync();

        //    // Delete all users except admin in a separate save
        //    var nonAdmins = await _context.Users
        //        .Where(u => u.Role != "Admin")
        //        .ToListAsync();
        //    _context.Users.RemoveRange(nonAdmins);

        //    await _context.SaveChangesAsync();
        //    return true;
        //}

        // Delete a specific registration request
        public async Task<bool> DeleteRegistrationRequestAsync(int requestId)
        {
            var request = await _context.RegistrationRequests
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null) return false;

            _context.RegistrationRequests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }

        // Add multiple university records at once
        public async Task<(int added, int skipped)> AddUniversityRecordsAsync(List<AddUniversityRecordDto> records)
        {
            int added = 0;
            int skipped = 0;

            foreach (var dto in records)
            {
                var existing = await _context.UniversityRecords
                    .FirstOrDefaultAsync(u => u.UniversityEmail == dto.UniversityEmail);

                if (existing != null)
                {
                    skipped++;
                    continue;
                }

                _context.UniversityRecords.Add(new UniversityRecord
                {
                    UniversityEmail = dto.UniversityEmail,
                    Username = dto.Username,
                    Password = dto.Password,
                    FullName = dto.FullName,
                    Role = dto.Role,
                    Department = dto.Department,
                    IsGraduate = dto.IsGraduate
                });

                added++;
            }

            await _context.SaveChangesAsync();
            return (added, skipped);
        }

        // Approve all pending requests at once
        public async Task<int> ApproveAllRequestsAsync()
        {
            var pendingRequests = await _context.RegistrationRequests
                .Where(r => r.Status == "Pending")
                .ToListAsync();

            int approved = 0;

            foreach (var request in pendingRequests)
            {
                var universityRecord = await _context.UniversityRecords
                    .FirstOrDefaultAsync(u => u.UniversityEmail == request.UniversityEmail);

                if (universityRecord == null) continue;

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.UniversityEmail);

                if (existingUser != null)
                {
                    request.Status = "Approved";
                    continue;
                }

                _context.Users.Add(new User
                {
                    Username = universityRecord.Username,
                    Email = universityRecord.UniversityEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(universityRecord.Password),
                    Role = char.ToUpper(universityRecord.Role[0]) + universityRecord.Role.Substring(1).ToLower(),
                    CreatedAt = DateTime.UtcNow
                });

                request.Status = "Approved";
                approved++;
            }

            await _context.SaveChangesAsync();
            return approved;
        }

        // ── Head of Department ───────────────────────────────────────────────

        // Check if department already has an HOD — returns conflict info for the frontend
        public async Task<SetHeadOfDepartmentResponseDto> CheckAndSetHeadOfDepartmentAsync(int supervisorId)
        {
            // Must be a supervisor with a profile
            var supervisor = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Id == supervisorId && u.Role == "Supervisor");

            if (supervisor == null)
                return new SetHeadOfDepartmentResponseDto
                {
                    HasConflict = false,
                    Success = false,
                    Message = "Supervisor not found."
                };

            var department = supervisor.UserProfile?.Department;
            if (department == null)
                return new SetHeadOfDepartmentResponseDto
                {
                    HasConflict = false,
                    Success = false,
                    Message = "This supervisor has no department set in their profile."
                };

            // Check if this supervisor is already the HOD
            if (supervisor.IsHeadOfDepartment)
                return new SetHeadOfDepartmentResponseDto
                {
                    HasConflict = false,
                    Success = false,
                    Message = "This supervisor is already the head of department."
                };

            // Check if another supervisor in the same department is already HOD
            var existingHod = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u =>
                    u.Role == "Supervisor" &&
                    u.IsHeadOfDepartment &&
                    u.UserProfile != null &&
                    u.UserProfile.Department == department &&
                    u.Id != supervisorId);

            if (existingHod != null)
            {
                // Conflict — frontend should show a warning popup
                return new SetHeadOfDepartmentResponseDto
                {
                    HasConflict = true,
                    Success = false,
                    ExistingHodName = existingHod.UserProfile?.FullName ?? existingHod.Username,
                    Message = $"Department '{department}' already has a head of department."
                };
            }

            // No conflict — set directly
            supervisor.IsHeadOfDepartment = true;
            await _context.SaveChangesAsync();

            return new SetHeadOfDepartmentResponseDto
            {
                HasConflict = false,
                Success = true,
                Message = "Supervisor set as head of department successfully."
            };
        }

        // Admin confirmed replacement — demote old HOD, promote new one
        public async Task<(bool success, string message)> ReplaceHeadOfDepartmentAsync(int supervisorId)
        {
            var supervisor = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Id == supervisorId && u.Role == "Supervisor");

            if (supervisor == null)
                return (false, "Supervisor not found.");

            var department = supervisor.UserProfile?.Department;
            if (department == null)
                return (false, "This supervisor has no department set in their profile.");

            // Demote existing HOD
            var existingHod = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u =>
                    u.Role == "Supervisor" &&
                    u.IsHeadOfDepartment &&
                    u.UserProfile != null &&
                    u.UserProfile.Department == department &&
                    u.Id != supervisorId);

            if (existingHod != null)
            {
                existingHod.IsHeadOfDepartment = false;

                // Notify old HOD
                _context.Notifications.Add(new Notification
                {
                    Title = "Head of Department Status Removed",
                    Message = $"You have been removed as Head of Department for the '{department}' department by the admin.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = existingHod.Id
                });
            }

            // Promote new HOD
            supervisor.IsHeadOfDepartment = true;
            await _context.SaveChangesAsync();

            return (true, "Head of department replaced successfully.");
        }

        // Remove HOD status from a supervisor
        public async Task<(bool success, string message)> RemoveHeadOfDepartmentAsync(int supervisorId)
        {
            var supervisor = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Id == supervisorId && u.Role == "Supervisor");

            if (supervisor == null)
                return (false, "Supervisor not found.");

            if (!supervisor.IsHeadOfDepartment)
                return (false, "This supervisor is not a head of department.");

            supervisor.IsHeadOfDepartment = false;

            var department = supervisor.UserProfile?.Department ?? "your department";

            _context.Notifications.Add(new Notification
            {
                Title = "Head of Department Status Removed",
                Message = $"You have been removed as Head of Department for the '{department}' department by the admin.",
                CreatedAt = DateTime.UtcNow,
                UserId = supervisor.Id
            });

            await _context.SaveChangesAsync();
            return (true, "Head of department status removed successfully.");
        }
      
    }
}