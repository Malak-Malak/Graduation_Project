using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Kanban;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class KanbanService
    {
        private readonly ApplicationDbContext _context;

        public KanbanService(ApplicationDbContext context)
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

        // Map TaskItem to TaskDto
        private TaskDto MapToDto(TaskItem task)
        {
            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Deadline = task.Deadline,
                CreatedBy = task.CreatedBy?.UserProfile != null
                    ? task.CreatedBy.UserProfile.FullName
                    : task.CreatedBy?.Username ?? "",
                AssignedMembers = task.Assignments?.Select(a => new AssignedMemberDto
                {
                    UserId = a.UserId,
                    Username = a.User?.Username ?? "",
                    FullName = a.User?.UserProfile != null
                        ? a.User.UserProfile.FullName
                        : a.User?.Username ?? ""
                }).ToList() ?? new List<AssignedMemberDto>()
            };
        }

        // Get kanban board for a team
        public async Task<KanbanBoardDto?> GetBoardAsync(int userId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return null;

            var tasks = await _context.TaskItems
                .Include(t => t.CreatedBy)
                    .ThenInclude(u => u.UserProfile)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.User)
                        .ThenInclude(u => u.UserProfile)
                .Where(t => t.TeamId == teamId)
                .ToListAsync();

            return new KanbanBoardDto
            {
                ToDo = tasks.Where(t => t.Status == "To Do").Select(MapToDto).ToList(),
                InProgress = tasks.Where(t => t.Status == "In Progress").Select(MapToDto).ToList(),
                Done = tasks.Where(t => t.Status == "Done").Select(MapToDto).ToList()
            };
        }

        // Create a task
        public async Task<bool> CreateTaskAsync(int userId, CreateTaskDto dto)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            // Validate status
            var validStatuses = new[] { "To Do", "In Progress", "Done" };
            if (!validStatuses.Contains(dto.Status))
                dto.Status = "To Do";

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status,
                Deadline = dto.Deadline,
                TeamId = teamId.Value,
                CreatedByUserId = userId
            };

            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();

            // Assign members
            if (dto.AssignedUserIds != null && dto.AssignedUserIds.Any())
            {
                foreach (var assignedUserId in dto.AssignedUserIds)
                {
                    // Check user is in the team
                    var isMember = await _context.TeamMembers
                        .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == assignedUserId);

                    if (!isMember) continue;

                    _context.TaskAssignments.Add(new TaskAssignment
                    {
                        TaskItemId = task.Id,
                        UserId = assignedUserId
                    });
                }

                await _context.SaveChangesAsync();
            }

            return true;
        }

        // Update a task
        public async Task<bool> UpdateTaskAsync(int userId, int taskId, UpdateTaskDto dto)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            var task = await _context.TaskItems
                .Include(t => t.Assignments)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.TeamId == teamId);

            if (task == null) return false;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Deadline = dto.Deadline;

            // Update assignments
            _context.TaskAssignments.RemoveRange(task.Assignments);

            if (dto.AssignedUserIds != null && dto.AssignedUserIds.Any())
            {
                foreach (var assignedUserId in dto.AssignedUserIds)
                {
                    var isMember = await _context.TeamMembers
                        .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == assignedUserId);

                    if (!isMember) continue;

                    _context.TaskAssignments.Add(new TaskAssignment
                    {
                        TaskItemId = task.Id,
                        UserId = assignedUserId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Update task status (drag and drop)
        public async Task<bool> UpdateTaskStatusAsync(int userId, UpdateTaskStatusDto dto)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            var task = await _context.TaskItems
                .FirstOrDefaultAsync(t => t.Id == dto.TaskId && t.TeamId == teamId);

            if (task == null) return false;

            var validStatuses = new[] { "To Do", "In Progress", "Done" };
            if (!validStatuses.Contains(dto.Status)) return false;

            task.Status = dto.Status;
            await _context.SaveChangesAsync();
            return true;
        }

        // Delete a task
        public async Task<bool> DeleteTaskAsync(int userId, int taskId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return false;

            var task = await _context.TaskItems
                .FirstOrDefaultAsync(t => t.Id == taskId && t.TeamId == teamId);

            if (task == null) return false;

            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        // Get team members for assignment
        public async Task<List<AssignedMemberDto>> GetTeamMembersAsync(int userId)
        {
            var teamId = await GetTeamIdAsync(userId);
            if (teamId == null) return new List<AssignedMemberDto>();

            return await _context.TeamMembers
                .Include(tm => tm.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(tm => tm.TeamId == teamId)
                .Select(tm => new AssignedMemberDto
                {
                    UserId = tm.UserId,
                    Username = tm.User.Username,
                    FullName = tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username
                })
                .ToListAsync();
        }
    }
}