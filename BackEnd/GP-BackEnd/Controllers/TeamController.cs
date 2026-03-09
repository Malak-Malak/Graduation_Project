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

        // GET api/team/available-teams
        [HttpGet("available-teams")]
        public async Task<IActionResult> GetAvailableTeams()
        {
            var teams = await _teamService.GetAvailableTeamsAsync();
            return Ok(teams);
        }

        // GET api/team/supervisors
        [HttpGet("supervisors")]
        public async Task<IActionResult> GetAllSupervisors()
        {
            var supervisors = await _teamService.GetAllSupervisorsAsync();
            return Ok(supervisors);
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
        [HttpPost("send-join-request-to-a-team")]
        public async Task<IActionResult> SendJoinRequest([FromBody] SendJoinRequestDto dto)
        {
            var senderId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.SendJoinRequestAsync(senderId, dto);

            if (!result)
                return BadRequest("Could not send join request. Team may be full or student already has a pending request.");

            return Ok("Join request sent successfully.");
        }

        // POST api/team/request-to-join
        [HttpPost("invite-a-student-to-join")]
        public async Task<IActionResult> RequestToJoinTeam([FromBody] JoinTeamRequestDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.RequestToJoinTeamAsync(studentId, dto);

            if (!result)
                return BadRequest("Could not send request. You may already be in a team or have a pending request.");

            return Ok("Request sent successfully. Waiting for team approval.");
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

        // POST api/team/respond-to-student-request
        [HttpPost("respond-to-student-request")]
        public async Task<IActionResult> RespondToStudentRequest([FromBody] RespondToJoinRequestDto dto)
        {
            var memberId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.RespondToStudentRequestAsync(memberId, dto);

            if (!result)
                return BadRequest("Request not found or you are not a member of this team.");

            return Ok(dto.IsAccepted ? "Student added to the team." : "Request rejected.");
        }

        // POST api/team/request-leave
        [HttpPost("request-leave")]
        public async Task<IActionResult> RequestLeave()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.RequestLeaveTeamAsync(studentId);

            if (!result)
                return BadRequest("Could not send leave request. You may not be in a team or already have a pending leave request.");

            return Ok("Leave request sent to supervisor.");
        }

        // POST api/team/respond-to-leave-request
        [HttpPost("respond-to-leave-request")]
        public async Task<IActionResult> RespondToLeaveRequest([FromBody] RespondToLeaveRequestDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _teamService.RespondToLeaveRequestAsync(supervisorId, dto.TeamMemberId, dto.IsApproved);

            if (!result)
                return BadRequest("Leave request not found or you are not the supervisor of this team.");

            return Ok(dto.IsApproved ? "Student has been removed from the team." : "Leave request rejected.");
        }
    }
}