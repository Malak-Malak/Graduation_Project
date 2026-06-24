using GP_BackEnd.Data;
using GP_BackEnd.DTOs.User;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class UserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UniversityInfoDto?> GetMyUniversityInfoAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            var record = await _context.UniversityRecords
                .FirstOrDefaultAsync(r => r.UniversityEmail == user.Email);

            if (record == null) return null;

            return new UniversityInfoDto
            {
                Username = record.Username,
                UniversityEmail = record.UniversityEmail,
                Department = record.Department
            };
        }
    }
}