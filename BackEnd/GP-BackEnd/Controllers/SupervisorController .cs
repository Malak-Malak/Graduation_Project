using GP_BackEnd.DTOs.Supervisor;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Supervisor")]
    public class SupervisorController : ControllerBase
    {
        private readonly SupervisorService _supervisorService;

        public SupervisorController(SupervisorService supervisorService)
        {
            _supervisorService = supervisorService;
        }

        // GET api/supervisor/pending-team-requests
        [HttpGet("pending-team-requests")]
        public async Task<IActionResult> GetPendingTeamRequests()
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var requests = await _supervisorService.GetPendingTeamRequestsAsync(supervisorId);
            return Ok(requests);
        }

        // POST api/supervisor/respond-to-team-request
        [HttpPost("respond-to-team-request")]
        public async Task<IActionResult> RespondToTeamRequest([FromBody] RespondToTeamRequestDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _supervisorService.RespondToTeamRequestAsync(supervisorId, dto);

            if (!result)
                return BadRequest("Team request not found or already responded to.");

            return Ok(dto.IsApproved ? "Team approved successfully." : "Team rejected.");
        }

        // POST api/supervisor/respond-to-leave-request
        [HttpPost("respond-to-leave-request")]
        public async Task<IActionResult> RespondToLeaveRequest([FromBody] RespondToLeaveRequestDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _supervisorService.RespondToLeaveRequestAsync(supervisorId, dto);

            if (!result)
                return BadRequest("Leave request not found or you are not the supervisor of this team.");

            return Ok(dto.IsApproved ? "Student has been removed from the team." : "Leave request rejected.");
        }

        // PUT api/supervisor/set-max-teams
        [HttpPut("set-max-teams")]
        public async Task<IActionResult> SetMaxTeams([FromBody] SetMaxTeamsDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _supervisorService.SetMaxTeamsAsync(supervisorId, dto);

            if (!result)
                return BadRequest("Could not update max teams.");

            return Ok("Max teams updated successfully.");
        }
    }
}