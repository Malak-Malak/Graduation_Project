using GP_BackEnd.DTOs.UserProfile;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly UserProfileService _service;

        public UserProfileController(UserProfileService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var profile = await _service.GetProfile(userId);

            if (profile == null)
                return NotFound(new { message = "Profile not found" });

            return Ok(profile);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] CreateUserProfile dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var (success, message) = await _service.CreateProfile(userId, dto);

            if (!success)
                return Conflict(new { message });

            return StatusCode(201, new { message });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var (found, message) = await _service.UpdateProfile(userId, dto);

            if (!found)
                return NotFound(new { message });

            return Ok(new { message });
        }
        // GET api/userprofile/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfileByUserId(int userId)
        {
            var profile = await _service.GetProfileByUserId(userId);

            if (profile == null)
                return NotFound(new { message = "Profile not found" });

            return Ok(profile);
        }
    }
}