using GP_BackEnd.DTOs.Student;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "student")]
    public class StudentController : ControllerBase
    {
        private readonly StudentService _studentService;

        public StudentController(StudentService studentService)
        {
            _studentService = studentService;
        }

        // GET api/student/available-students
        [HttpGet("available-students")]
        public async Task<IActionResult> GetAvailableStudents()
        {
            var students = await _studentService.GetAvailableStudentsAsync();
            return Ok(students);
        }

        // GET api/student/supervisors
        [HttpGet("supervisors")]
        public async Task<IActionResult> GetAllSupervisors()
        {
            var supervisors = await _studentService.GetAllSupervisorsAsync();
            return Ok(supervisors);
        }

        // GET api/student/available-teams
        [HttpGet("available-teams")]
        public async Task<IActionResult> GetAvailableTeams()
        {
            var teams = await _studentService.GetAvailableTeamsAsync();
            return Ok(teams);
        }

        // GET api/student/my-team
        [HttpGet("my-team")]
        public async Task<IActionResult> GetMyTeam()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var team = await _studentService.GetMyTeamAsync(studentId);

            if (team == null)
                return NotFound("You are not in any team.");

            return Ok(team);
        }

        // GET api/student/my-invitations
        [HttpGet("my-invitations")]
        public async Task<IActionResult> GetMyInvitations()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var invitations = await _studentService.GetMyInvitationsAsync(studentId);
            return Ok(invitations);
        }

        // POST api/student/create-team
        [HttpPost("create-team")]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.CreateTeamAsync(studentId, dto);

            if (!result)
                return BadRequest("Could not create team. You may already be in a team, have a pending request, or the supervisor is invalid.");

            return Ok("Team created successfully. Waiting for supervisor approval.");
        }

        // POST api/student/send-invitation
        [HttpPost("send-invitation")]
        public async Task<IActionResult> SendInvitation([FromBody] SendInvitationDto dto)
        {
            var senderId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.SendInvitationAsync(senderId, dto);

            if (!result)
                return BadRequest("Could not send invitation. Team may be full or student is already in a team.");

            return Ok("Invitation sent successfully.");
        }

        // POST api/student/request-to-join
        [HttpPost("request-to-join")]
        public async Task<IActionResult> RequestToJoin([FromBody] RequestToJoinDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.RequestToJoinTeamAsync(studentId, dto);

            if (!result)
                return BadRequest("Could not send request. You may already be in a team or have a pending request.");

            return Ok("Request sent successfully. Waiting for team approval.");
        }

        // POST api/student/respond-to-invitation
        [HttpPost("respond-to-invitation")]
        public async Task<IActionResult> RespondToInvitation([FromBody] RespondToInvitationDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.RespondToInvitationAsync(studentId, dto);

            if (!result)
                return BadRequest("Invitation not found or team is full.");

            return Ok(dto.IsAccepted ? "You have joined the team." : "You have rejected the invitation.");
        }

        // POST api/student/respond-to-join-request
        [HttpPost("respond-to-join-request")]
        public async Task<IActionResult> RespondToJoinRequest([FromBody] RespondToInvitationDto dto)
        {
            var memberId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.RespondToJoinRequestAsync(memberId, dto);

            if (!result)
                return BadRequest("Request not found or you are not a member of this team.");

            return Ok(dto.IsAccepted ? "Student added to the team." : "Request rejected.");
        }

        // POST api/student/request-leave
        [HttpPost("request-leave")]
        public async Task<IActionResult> RequestLeave()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.RequestLeaveTeamAsync(studentId);

            if (!result)
                return BadRequest("Could not send leave request. You may not be in a team or already have a pending leave request.");

            return Ok("Leave request sent to supervisor.");
        }
    }
}