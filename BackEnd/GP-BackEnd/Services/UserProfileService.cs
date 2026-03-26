using GP_BackEnd.Data;
using GP_BackEnd.DTOs;
using GP_BackEnd.DTOs.UserProfile;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class UserProfileService
    {
        private readonly ApplicationDbContext _context;

        public UserProfileService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDto> GetProfile(int userId)
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return null;

            return new UserProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                PhoneNumber = profile.PhoneNumber,
                FullName = profile.FullName,
                Department = profile.Department,
                Field = profile.Field,
                GitHubLink = profile.GitHubLink,
                LinkedinLink = profile.LinkedinLink,
                PersonalEmail = profile.PersonalEmail,
                IsGraduate = profile.IsGraduate,
                TotalNumOfCreditCards = profile.TotalNumOfCreditCards,
                Bio = profile.Bio
            };
        }

        public async Task<(bool success, string message)> CreateProfile(int userId, CreateUserProfile dto)
        {
            var existing = await _context.UserProfiles
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (existing != null)
                return (false, "Profile already exists");

            var profile = new UserProfile
            {
                UserId = userId,
                PhoneNumber = dto.PhoneNumber,
                FullName = dto.FullName,
                Department = dto.Department,
                GitHubLink = dto.GitHubLink,
                LinkedinLink = dto.LinkedinLink,
                Field = dto.Field,
                Bio = dto.Bio,
                PersonalEmail = dto.PersonalEmail,
                TotalNumOfCreditCards = 0
            };

            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return (true, "Profile created successfully");
        }

        public async Task<(bool found, string message)> UpdateProfile(int userId, UpdateProfileDto dto)
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return (false, "Profile not found");

            profile.PhoneNumber = dto.PhoneNumber;
            profile.FullName = dto.FullName;
            profile.Department = dto.Department;
            profile.GitHubLink = dto.GitHubLink;
            profile.LinkedinLink = dto.LinkedinLink;
            profile.Field = dto.Field;
            profile.TotalNumOfCreditCards = dto.TotalNumOfCreditCards;
            profile.Bio = dto.Bio;
            profile.PersonalEmail = dto.PersonalEmail;

            await _context.SaveChangesAsync();

            return (true, "Profile updated successfully");
        }
        public async Task<UserProfileDto> GetProfileByUserId(int userId)
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return null;

            return new UserProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                PhoneNumber = profile.PhoneNumber,
                FullName = profile.FullName,
                Department = profile.Department,
                Field = profile.Field,
                GitHubLink = profile.GitHubLink,
                LinkedinLink = profile.LinkedinLink,
                PersonalEmail = profile.PersonalEmail,
                IsGraduate = profile.IsGraduate,
                TotalNumOfCreditCards = profile.TotalNumOfCreditCards,
                Bio = profile.Bio
            };
        }
    }
}