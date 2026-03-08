using GP_BackEnd.DTOs.Team;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamController : ControllerBase
    {
        private readonly TeamService _teamService;

        public TeamController(TeamService teamService)
        {
            _teamService = teamService;
        }

        // GET api/team/available-students
        [HttpGet("available-students")]
        public async Task<IActionResult> GetAvailableStudents()
        {
            var students = await _teamService.GetAvailableStudentsAsync();
            return Ok(students);
        }

        // POST api/team/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.CreateTeamAsync(studentId, dto);

            if (!result)
                return BadRequest("Could not create team. You may already be in a team or have a pending request.");

            return Ok("Team created successfully. Waiting for supervisor approval.");
        }

        // POST api/team/send-join-request
        [HttpPost("send-join-request")]
        public async Task<IActionResult> SendJoinRequest([FromBody] SendJoinRequestDto dto)
        {
            var senderId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.SendJoinRequestAsync(senderId, dto);

            if (!result)
                return BadRequest("Could not send join request. Team may be full or student already has a pending request.");

            return Ok("Join request sent successfully.");
        }

        // POST api/team/respond-to-join-request
        [HttpPost("respond-to-join-request")]
        public async Task<IActionResult> RespondToJoinRequest([FromBody] RespondToJoinRequestDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.RespondToJoinRequestAsync(studentId, dto);

            if (!result)
                return BadRequest("Join request not found.");

            return Ok(dto.IsAccepted ? "You have joined the team." : "You have rejected the join request.");
        }

        // GET api/team/my-team
        [HttpGet("my-team")]
        public async Task<IActionResult> GetMyTeam()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var team = await _teamService.GetMyTeamAsync(studentId);

            if (team == null)
                return NotFound("You are not in any team.");

            return Ok(team);
        }

        // POST api/team/leave
        [HttpPost("leave")]
        public async Task<IActionResult> LeaveTeam()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.LeaveTeamAsync(studentId);

            if (!result)
                return BadRequest("You are not in any team.");

            return Ok("You have left the team.");
        }
    }
}