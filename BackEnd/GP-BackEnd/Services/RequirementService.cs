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

        // Get project id for a user
        private async Task<int?> GetProjectIdAsync(int userId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.UserId == userId);

            if (teamMember == null) return null;

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == teamMember.TeamId);

            return team?.ProjectId;
        }

        // Get all requirements for a project
        public async Task<List<RequirementDto>> GetRequirementsAsync(int userId)
        {
            var projectId = await GetProjectIdAsync(userId);
            if (projectId == null) return new List<RequirementDto>();

            return await _context.Requirements
                .Include(r => r.CreatedBy)
                    .ThenInclude(u => u.UserProfile)
                .Where(r => r.ProjectId == projectId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RequirementDto
                {
                    Id = r.Id,
                    Description = r.Description,
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
            var projectId = await GetProjectIdAsync(userId);
            if (projectId == null) return false;

            _context.Requirements.Add(new Requirement
            {
                Description = dto.Description,
                ProjectId = projectId.Value,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // Update a requirement
        public async Task<bool> UpdateRequirementAsync(int userId, int requirementId, UpdateRequirementDto dto)
        {
            var projectId = await GetProjectIdAsync(userId);
            if (projectId == null) return false;

            var requirement = await _context.Requirements
                .FirstOrDefaultAsync(r => r.Id == requirementId && r.ProjectId == projectId);

            if (requirement == null) return false;

            requirement.Description = dto.Description;
            await _context.SaveChangesAsync();
            return true;
        }

        // Delete a requirement
        public async Task<bool> DeleteRequirementAsync(int userId, int requirementId)
        {
            var projectId = await GetProjectIdAsync(userId);
            if (projectId == null) return false;

            var requirement = await _context.Requirements
                .FirstOrDefaultAsync(r => r.Id == requirementId && r.ProjectId == projectId);

            if (requirement == null) return false;

            _context.Requirements.Remove(requirement);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}