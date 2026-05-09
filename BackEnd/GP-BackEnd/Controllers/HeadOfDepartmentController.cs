using GP_BackEnd.DTOs.Admin;
using GP_BackEnd.DTOs.HeadOfDepartment;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HeadOfDepartmentController : ControllerBase
    {
        private readonly HeadOfDepartmentService _service;

        public HeadOfDepartmentController(HeadOfDepartmentService service)
        {
            _service = service;
        }

        // POST api/head/create-slot
        [HttpPost("create-slot")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> CreateSlot([FromBody] CreateDiscussionSlotDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _service.CreateSlotAsync(headId, dto);

            if (!result)
                return BadRequest("Could not create slot. You may not be a head of department.");

            return Ok("Discussion slot created successfully.");
        }

        // DELETE api/head/delete-slot/{slotId}
        [HttpDelete("delete-slot/{slotId}")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> DeleteSlot(int slotId)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _service.DeleteSlotAsync(headId, slotId);

            if (!result)
                return BadRequest("Slot not found or you are not the owner.");

            return Ok("Discussion slot deleted successfully.");
        }

        // GET api/head/slots
        [HttpGet("slots")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetMySlots()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var slots = await _service.GetMySlotsAsync(headId);
            return Ok(slots);
        }

        // POST api/head/assign-team-to-slot
        [HttpPost("assign-team-to-slot")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> AssignTeamToSlot([FromBody] AssignTeamToSlotDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _service.AssignTeamToSlotAsync(headId, dto);

            if (!result)
                return BadRequest("Could not assign team. Team may already have a slot or is not in your department.");

            return Ok("Team assigned to slot successfully.");
        }

        // GET api/head/department-teams
        [HttpGet("department-teams")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetDepartmentTeams()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var teams = await _service.GetDepartmentTeamsAsync(headId);
            return Ok(teams);
        }

        // GET api/head/department-supervisors
        [HttpGet("department-supervisors")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetDepartmentSupervisors()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var supervisors = await _service.GetDepartmentSupervisorsAsync(headId);
            return Ok(supervisors);
        }

        // GET api/head/student-requests
        [HttpGet("student-requests")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetStudentRequests()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var requests = await _service.GetDepartmentStudentRequestsAsync(headId);
            return Ok(requests);
        }

        // POST api/head/review-student-request
        [HttpPost("review-student-request")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> ReviewStudentRequest([FromBody] ApproveRequestDto dto)
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _service.ReviewStudentRequestAsync(headId, dto);

            if (!result)
                return BadRequest("Request not found or student is not in your department.");

            return Ok(dto.IsApproved ? "Student approved successfully." : "Request rejected.");
        }

        // GET api/head/department-students
        [HttpGet("department-students")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetDepartmentStudents()
        {
            var headId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var students = await _service.GetDepartmentStudentsAsync(headId);
            return Ok(students);
        }

        // GET api/head/my-discussion-slot
        [HttpGet("my-discussion-slot")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyDiscussionSlot()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var slot = await _service.GetMyDiscussionSlotAsync(studentId);

            if (slot == null)
                return NotFound("No discussion slot assigned yet.");

            return Ok(slot);
        }

        // GET api/head/my-teams-slots
        [HttpGet("my-teams-slots")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetSupervisorTeamsSlots()
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var slots = await _service.GetSupervisorTeamsSlotsAsync(supervisorId);
            return Ok(slots);
        }
    }
}