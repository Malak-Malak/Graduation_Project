using GP_BackEnd.DTOs.Requirement;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RequirementController : ControllerBase
    {
        private readonly RequirementService _requirementService;

        public RequirementController(RequirementService requirementService)
        {
            _requirementService = requirementService;
        }

        // GET api/requirement
        [HttpGet]
        public async Task<IActionResult> GetRequirements()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var requirements = await _requirementService.GetRequirementsAsync(userId);
            return Ok(requirements);
        }

        // POST api/requirement/add
        [HttpPost("add")]
        public async Task<IActionResult> AddRequirement([FromBody] AddRequirementDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _requirementService.AddRequirementAsync(userId, dto);

            if (!result)
                return BadRequest("Could not add requirement. You may not have a project yet.");

            return Ok("Requirement added successfully.");
        }

        // PUT api/requirement/update/{requirementId}
        [HttpPut("update/{requirementId}")]
        public async Task<IActionResult> UpdateRequirement(int requirementId, [FromBody] UpdateRequirementDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _requirementService.UpdateRequirementAsync(userId, requirementId, dto);

            if (!result)
                return BadRequest("Requirement not found.");

            return Ok("Requirement updated successfully.");
        }

        // DELETE api/requirement/delete/{requirementId}
        [HttpDelete("delete/{requirementId}")]
        public async Task<IActionResult> DeleteRequirement(int requirementId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _requirementService.DeleteRequirementAsync(userId, requirementId);

            if (!result)
                return BadRequest("Requirement not found.");

            return Ok("Requirement deleted successfully.");
        }
    }
}