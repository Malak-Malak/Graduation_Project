using GP_BackEnd.DTOs.Appointment;
using GP_BackEnd.DTOs.Student;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly StudentService _studentService;

        private readonly AppointmentService _appointmentService;

        public StudentController(StudentService studentService, AppointmentService appointmentService)
        {
            _studentService = studentService;
            _appointmentService = appointmentService;
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
        // PUT api/student/update-project-info
        [HttpPut("update-project-info")]
        public async Task<IActionResult> UpdateProjectInfo([FromBody] UpdateProjectInfoDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.UpdateProjectInfoAsync(studentId, dto);

            if (!result)
                return BadRequest("Could not update project info. You may not be in a team.");

            return Ok("Project info updated successfully.");
        }
        // GET api/student/my-join-requests
        [HttpGet("my-join-requests")]
        public async Task<IActionResult> GetMyJoinRequests()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var requests = await _studentService.GetMyJoinRequestsAsync(studentId);
            return Ok(requests);
        }

        // GET api/student/team-join-requests
        [HttpGet("team-join-requests")]
        public async Task<IActionResult> GetTeamJoinRequests()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var requests = await _studentService.GetTeamJoinRequestsAsync(studentId);
            return Ok(requests);
        }

        // DELETE api/student/delete-join-request/{requestId}
        [HttpDelete("delete-join-request/{requestId}")]
        public async Task<IActionResult> DeleteMyJoinRequest(int requestId)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.DeleteMyJoinRequestAsync(studentId, requestId);

            if (!result)
                return BadRequest("Request not found or you are not the owner of this request.");

            return Ok("Join request deleted successfully.");
        }

        // POST api/student/reject-join-request/{requestId}
        [HttpPost("reject-join-request/{requestId}")]
        public async Task<IActionResult> RejectJoinRequest(int requestId)
        {
            var memberId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _studentService.RejectJoinRequestAsync(memberId, requestId);

            if (!result)
                return BadRequest("Request not found or you are not a member of this team.");

            return Ok("Join request rejected.");
        }
        // GET api/student/all-students
        [HttpGet("all-students")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _studentService.GetAllStudentsAsync();
            return Ok(students);
        }

        // GET api/student/supervisor-office-hours
        // Get the office hours of the student's supervisor
        [HttpGet("supervisor-office-hours")]
        public async Task<IActionResult> GetSupervisorOfficeHours()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var hours = await _appointmentService.GetSupervisorOfficeHoursAsync(studentId);
            return Ok(hours);
        }

        // POST api/student/request-appointment
        // Student picks an office hour slot and requests an appointment
        [HttpPost("request-appointment")]
        public async Task<IActionResult> RequestAppointment([FromBody] RequestAppointmentDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _appointmentService.RequestAppointmentAsync(studentId, dto);
            if (!result)
                return BadRequest("Could not request appointment. You may not be in a team, have a pending appointment, or the office hour slot is invalid.");
            return Ok("Appointment request sent successfully.");
        }

        // GET api/student/my-appointments
        // Get all appointments for the student's team (includes IsOnline, Excuse)
        [HttpGet("my-appointments")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var appointments = await _appointmentService.GetMyAppointmentsAsync(studentId);
            return Ok(appointments);
        }

        // PUT api/student/update-appointment
        // Student reschedules an appointment — excuse is mandatory
        [HttpPut("update-appointment")]
        public async Task<IActionResult> UpdateAppointment([FromBody] UpdateAppointmentDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _appointmentService.UpdateAppointmentAsync(studentId, dto);
            if (!result)
                return BadRequest("Could not update appointment. Make sure you provided an excuse and the office hour slot is valid.");
            return Ok("Appointment updated successfully. Supervisor and teammates have been notified.");
        }

        // POST api/student/switch-version
        [HttpPost("switch-version")]
        public async Task<IActionResult> SwitchVersion()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var newVersion = await _studentService.SwitchVersionAsync(studentId);

            if (newVersion == -1)
                return NotFound("User not found.");

            return Ok(new { currentVersion = newVersion, message = $"Switched to version {newVersion}" });
        }

        // GET api/student/current-version
        [HttpGet("current-version")]
        public async Task<IActionResult> GetCurrentVersion()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var version = await _studentService.GetCurrentVersionAsync(studentId);

            if (version == -1)
                return NotFound("User not found.");

            return Ok(new { currentVersion = version });
        }
    }
}
