using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Requirement;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class RequirementService
    {
        private readonly ApplicationDbContext _context;

        public RequirementService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get team id for a user
        private async Task<int?> GetTeamIdAsync(int userId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);
            return teamMember?.TeamId;
        }

        // Get all requirements for a team
        public async Task<List<RequirementDto>> GetRequirementsAsync(int userId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return new List<RequirementDto>();

            return await _context.Requirements
                .Include(r => r.CreatedBy)
                    .ThenInclude(u => u.UserProfile)
                .Where(r => r.TeamId == teamId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RequirementDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    Priority = r.Priority,
                    Type = r.Type,
                    GithubRepo = r.GithubRepo,

                    CreatedAt = r.CreatedAt,
                    CreatedByName = r.CreatedBy.UserProfile != null
                        ? r.CreatedBy.UserProfile.FullName
                        : r.CreatedBy.Username
                })
                .ToListAsync();
        }

        // Add a requirement
        public async Task<bool> AddRequirementAsync(int userId, AddRequirementDto dto)
        {
            var teamId = await GetTeamIdAsync(userId);  // ✅ was GetProjectIdAsync
            if (teamId == null) return false;

            _context.Requirements.Add(new Requirement
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Type = dto.Type,
                GithubRepo = dto.GithubRepo,

                TeamId = teamId.Value,              // ✅ was ProjectId
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Update a requirement
        public async Task<bool> UpdateRequirementAsync(int userId, int requirementId, UpdateRequirementDto dto)
        {
            var teamId = await GetTeamIdAsync(userId);  // ✅ was GetProjectIdAsync
            if (teamId == null) return false;

            var requirement = await _context.Requirements
                .FirstOrDefaultAsync(r => r.Id == requirementId && r.TeamId == teamId); // ✅ was ProjectId

            if (requirement == null) return false;

            requirement.Title = dto.Title;
            requirement.Description = dto.Description;
            requirement.GithubRepo = dto.GithubRepo;

            requirement.Priority = dto.Priority;
            requirement.Type = dto.Type;

            await _context.SaveChangesAsync();
            return true;
        }

        // Delete a requirement
        public async Task<bool> DeleteRequirementAsync(int userId, int requirementId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            var requirement = await _context.Requirements
                .FirstOrDefaultAsync(r => r.Id == requirementId && r.TeamId == teamId);

            if (requirement == null) return false;

            _context.Requirements.Remove(requirement);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}