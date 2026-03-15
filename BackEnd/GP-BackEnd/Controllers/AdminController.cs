using GP_BackEnd.DTOs.Admin;
using GP_BackEnd.Models;
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

        // POST api/admin/review-request
        [HttpPost("review-request")]
        public async Task<IActionResult> ReviewRequest([FromBody] ApproveRequestDto dto)
        {
            var result = await _adminService.ReviewRequestAsync(dto);

            if (!result)
                return BadRequest("Request not found or university record missing.");

            return Ok(dto.IsApproved ? "User account created successfully." : "Request rejected.");
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

        // GET api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }
        // GET api/admin/all-requests
        [HttpGet("all-requests")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _adminService.GetAllRequestsAsync();
            return Ok(requests);
        }
        // GET: api/admin/university-records
        [HttpGet("university-records")]
        public async Task<IActionResult> GetAllUniversityRecords()
        {
            var records = await _adminService.GetAllUniversityRecordsAsync();
            return Ok(records);
        }

        // GET: api/admin/university-records/{email}
        [HttpGet("university-records/{email}")]
        public async Task<IActionResult> GetUniversityRecordByEmail(string email)
        {
            var record = await _adminService.GetUniversityRecordByEmailAsync(email);
            if (record == null)
                return NotFound("University record not found.");
            return Ok(record);
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
        // DELETE api/admin/clear-all-data
        [HttpDelete("clear-all-data")]
        public async Task<IActionResult> ClearAllData()
        {
            await _adminService.ClearAllDataAsync();
            return Ok("All data cleared successfully. Admin account preserved.");
        }
    }
}