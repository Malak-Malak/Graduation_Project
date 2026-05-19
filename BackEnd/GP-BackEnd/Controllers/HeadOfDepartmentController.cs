using GP_BackEnd.DTOs.Admin;
using GP_BackEnd.DTOs.HeadOfDepartment;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/head")]
    [Authorize]
    public class HeadOfDepartmentController : ControllerBase
    {
        private readonly HeadOfDepartmentService _service;

        public HeadOfDepartmentController(HeadOfDepartmentService service)
        {
            _service = service;
        }

        // ── Discussion Slots ─────────────────────────────────────────────────

        // POST api/head/create-slot
        [HttpPost("create-slot")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> CreateSlot([FromBody] CreateDiscussionSlotDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _service.CreateSlotAsync(headId, dto);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // DELETE api/head/delete-slot/{slotId}
        [HttpDelete("delete-slot/{slotId}")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> DeleteSlot(int slotId)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _service.DeleteSlotAsync(headId, slotId);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // GET api/head/slots
        [HttpGet("slots")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetMySlots()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var slots = await _service.GetMySlotsAsync(headId);

            if (slots == null) return StatusCode(403, "You are not a head of department.");
            return Ok(slots);
        }

        // ── Team-Slot Assignment ─────────────────────────────────────────────

        // POST api/head/assign-team-to-slot
        [HttpPost("assign-team-to-slot")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> AssignTeamToSlot([FromBody] AssignTeamToSlotDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _service.AssignTeamToSlotAsync(headId, dto);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // PUT api/head/update-team-slot
        [HttpPut("update-team-slot")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> UpdateTeamSlot([FromBody] UpdateTeamSlotDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _service.UpdateTeamSlotAsync(headId, dto);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // DELETE api/head/unassign-team/{teamId}
        [HttpDelete("unassign-team/{teamId}")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> UnassignTeamFromSlot(int teamId)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _service.UnassignTeamFromSlotAsync(headId, teamId);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // ── Department Views ─────────────────────────────────────────────────

        // GET api/head/department-teams
        [HttpGet("department-teams")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetDepartmentTeams()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var teams = await _service.GetDepartmentTeamsAsync(headId);

            if (teams == null) return StatusCode(403, "You are not a head of department.");
            return Ok(teams);
        }

        // GET api/head/department-supervisors
        [HttpGet("department-supervisors")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetDepartmentSupervisors()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var supervisors = await _service.GetDepartmentSupervisorsAsync(headId);

            if (supervisors == null) return StatusCode(403, "You are not a head of department.");
            return Ok(supervisors);
        }

        // GET api/head/department-students
        [HttpGet("department-students")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetDepartmentStudents()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var students = await _service.GetDepartmentStudentsAsync(headId);

            if (students == null) return StatusCode(403, "You are not a head of department.");
            return Ok(students);
        }

        // ── Student Registration ─────────────────────────────────────────────

        // GET api/head/student-requests
        [HttpGet("student-requests")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetStudentRequests()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _service.GetDepartmentStudentRequestsAsync(headId);

            if (requests == null) return StatusCode(403, "You are not a head of department.");
            return Ok(requests);
        }

        // POST api/head/review-student-request
        [HttpPost("review-student-request")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> ReviewStudentRequest([FromBody] ApproveRequestDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _service.ReviewStudentRequestAsync(headId, dto);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // ── Student & Supervisor Views ────────────────────────────────────────

        // GET api/head/my-discussion-slot  (student)
        [HttpGet("my-discussion-slot")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyDiscussionSlot()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var slot = await _service.GetMyDiscussionSlotAsync(studentId);

            if (slot == null) return NotFound("No discussion slot assigned to your team yet.");
            return Ok(slot);
        }

        // GET api/head/my-teams-slots  (supervisor)
        [HttpGet("my-teams-slots")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetSupervisorTeamsSlots()
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var slots = await _service.GetSupervisorTeamsSlotsAsync(supervisorId);
            return Ok(slots);
        }
    }
}