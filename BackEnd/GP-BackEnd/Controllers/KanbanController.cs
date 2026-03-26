using GP_BackEnd.DTOs.Kanban;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class KanbanController : ControllerBase
    {
        private readonly KanbanService _kanbanService;

        public KanbanController(KanbanService kanbanService)
        {
            _kanbanService = kanbanService;
        }

        // GET api/kanban/board
        [HttpGet("board")]
        public async Task<IActionResult> GetBoard()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var board = await _kanbanService.GetBoardAsync(userId);

            if (board == null)
                return NotFound("You are not in any team.");

            return Ok(board);
        }

        // GET api/kanban/team-members
        [HttpGet("team-members")]
        public async Task<IActionResult> GetTeamMembers()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var members = await _kanbanService.GetTeamMembersAsync(userId);
            return Ok(members);
        }

        // POST api/kanban/create-task
        [HttpPost("create-task")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _kanbanService.CreateTaskAsync(userId, dto);

            if (!result)
                return BadRequest("Could not create task. You may not be in a team.");

            return Ok("Task created successfully.");
        }

        // PUT api/kanban/update-task/{taskId}
        [HttpPut("update-task/{taskId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UpdateTask(int taskId, [FromBody] UpdateTaskDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _kanbanService.UpdateTaskAsync(userId, taskId, dto);

            if (!result)
                return BadRequest("Could not update task.");

            return Ok("Task updated successfully.");
        }

        // PUT api/kanban/update-status
        [HttpPut("update-status")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UpdateTaskStatus([FromBody] UpdateTaskStatusDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _kanbanService.UpdateTaskStatusAsync(userId, dto);

            if (!result)
                return BadRequest("Could not update task status.");

            return Ok("Task status updated successfully.");
        }

        // DELETE api/kanban/delete-task/{taskId}
        [HttpDelete("delete-task/{taskId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _kanbanService.DeleteTaskAsync(userId, taskId);

            if (!result)
                return BadRequest("Could not delete task.");

            return Ok("Task deleted successfully.");
        }
    }
}