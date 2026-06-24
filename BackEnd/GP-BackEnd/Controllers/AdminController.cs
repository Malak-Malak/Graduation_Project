using GP_BackEnd.DTOs.Admin;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        // GET api/admin/pending-requests
        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var requests = await _adminService.GetPendingRequestsAsync();
            return Ok(requests);
        }

        // GET api/admin/all-requests
        [HttpGet("all-requests")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _adminService.GetAllRequestsAsync();
            return Ok(requests);
        }

        // POST api/admin/review-request
        [HttpPost("review-request")]
        public async Task<IActionResult> ReviewRequest([FromBody] ApproveRequestDto dto)
        {
            var result = await _adminService.ReviewRequestAsync(dto);

            if (!result)
                return BadRequest("Request not found or university record missing.");

            return Ok(dto.IsApproved ? "User account created successfully." : "Request rejected.");
        }

        // GET api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        // GET api/admin/university-records
        [HttpGet("university-records")]
        public async Task<IActionResult> GetAllUniversityRecords()
        {
            var records = await _adminService.GetAllUniversityRecordsAsync();
            return Ok(records);
        }

        // GET api/admin/university-records/{email}
        [HttpGet("university-records/{email}")]
        public async Task<IActionResult> GetUniversityRecordByEmail(string email)
        {
            var record = await _adminService.GetUniversityRecordByEmailAsync(email);
            if (record == null)
                return NotFound("University record not found.");
            return Ok(record);
        }

        // POST api/admin/add-university-record
        [HttpPost("add-university-record")]
        public async Task<IActionResult> AddUniversityRecord([FromBody] AddUniversityRecordDto dto)
        {
            var result = await _adminService.AddUniversityRecordAsync(dto);

            if (!result)
                return BadRequest("A record with this email already exists.");

            return Ok("University record added successfully.");
        }

        // POST api/admin/add-university-records-bulk
        [HttpPost("add-university-records-bulk")]
        public async Task<IActionResult> AddUniversityRecordsBulk([FromBody] List<AddUniversityRecordDto> records)
        {
            var (added, skipped) = await _adminService.AddUniversityRecordsAsync(records);
            return Ok(new { added, skipped });
        }

        // DELETE api/admin/delete-university-record/{email}
        [HttpDelete("delete-university-record/{email}")]
        public async Task<IActionResult> DeleteUniversityRecord(string email)
        {
            var result = await _adminService.DeleteUniversityRecordAsync(email);

            if (!result)
                return NotFound("University record not found.");

            return Ok("University record deleted successfully.");
        }

        // DELETE api/admin/delete-request/{id}
        [HttpDelete("delete-request/{id}")]
        public async Task<IActionResult> DeleteRegistrationRequest(int id)
        {
            var result = await _adminService.DeleteRegistrationRequestAsync(id);

            if (!result)
                return NotFound("Request not found.");

            return Ok("Request deleted successfully.");
        }

        //// DELETE api/admin/clear-all-data
        //[HttpDelete("clear-all-data")]
        //public async Task<IActionResult> ClearAllData()
        //{
        //    await _adminService.ClearAllDataAsync();
        //    return Ok("All data cleared successfully. Admin account preserved.");
        //}

        // POST api/admin/approve-all-requests
        [HttpPost("approve-all-requests")]
        public async Task<IActionResult> ApproveAllRequests()
        {
            var approved = await _adminService.ApproveAllRequestsAsync();
            return Ok(new { approved, message = $"{approved} users approved and accounts created." });
        }

        // ── Head of Department ───────────────────────────────────────────────

        // PUT api/admin/set-head-of-department/{supervisorId}
        // First call: checks if department already has an HOD.
        // If HasConflict = true → show warning popup to admin.
        // If HasConflict = false and Success = true → done, no popup needed.
        [HttpPut("set-head-of-department/{supervisorId}")]
        public async Task<IActionResult> SetHeadOfDepartment(int supervisorId)
        {
            var response = await _adminService.CheckAndSetHeadOfDepartmentAsync(supervisorId);

            if (!response.Success && !response.HasConflict)
                return BadRequest(response.Message);

            return Ok(response);
        }

        // PUT api/admin/replace-head-of-department/{supervisorId}
        // Called only after admin confirms the replacement warning popup.
        // Demotes the current HOD and promotes the new one.
        // The old HOD receives a notification.
        [HttpPut("replace-head-of-department/{supervisorId}")]
        public async Task<IActionResult> ReplaceHeadOfDepartment(int supervisorId)
        {
            var (success, message) = await _adminService.ReplaceHeadOfDepartmentAsync(supervisorId);

            if (!success)
                return BadRequest(message);

            return Ok(message);
        }

        // DELETE api/admin/remove-head-of-department/{supervisorId}
        // Removes HOD status from a supervisor without replacing them.
        // The supervisor receives a notification.
        [HttpDelete("remove-head-of-department/{supervisorId}")]
        public async Task<IActionResult> RemoveHeadOfDepartment(int supervisorId)
        {
            var (success, message) = await _adminService.RemoveHeadOfDepartmentAsync(supervisorId);

            if (!success)
                return BadRequest(message);

            return Ok(message);
        }
    }
}