using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Admin;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

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

        // Approve or reject a request
        public async Task<bool> ReviewRequestAsync(ApproveRequestDto dto)
        {
            var request = await _context.RegistrationRequests
                .FirstOrDefaultAsync(r => r.Id == dto.RequestId);

            if (request == null) return false;

            if (dto.IsApproved)
            {
                // Find university record
                var universityRecord = await _context.UniversityRecords
                    .FirstOrDefaultAsync(u => u.UniversityEmail == request.UniversityEmail);

                if (universityRecord == null) return false;

                // Create user account
                var user = new User
                {
                    Username = universityRecord.Username,
                    Email = universityRecord.UniversityEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(universityRecord.Password),
                    Role = universityRecord.Role,
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

        // Add university record (for testing)
        public async Task<bool> AddUniversityRecordAsync(AddUniversityRecordDto dto)
        {
            var existing = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == dto.UniversityEmail);

            if (existing != null) return false;

            var record = new UniversityRecord
            {
                UniversityEmail = dto.UniversityEmail,
                Username = dto.Username,
                Password = dto.Password,
                FullName = dto.FullName,
                Role = dto.Role,
                Department = dto.Department,
                IsGraduate = dto.IsGraduate
            };

            _context.UniversityRecords.Add(record);
            await _context.SaveChangesAsync();
            return true;
        }

        // Get all users
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }
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
        public async Task<bool> DeleteUniversityRecordAsync(string universityEmail)
        {
            var record = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == universityEmail);

            if (record == null) return false;

            _context.UniversityRecords.Remove(record);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}