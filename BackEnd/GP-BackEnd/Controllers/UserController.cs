using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Student,Supervisor")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        // GET api/user/my-university-info
        [HttpGet("my-university-info")]
        public async Task<IActionResult> GetMyUniversityInfo()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var info = await _userService.GetMyUniversityInfoAsync(userId);

            if (info == null)
                return NotFound("No university record found for your account.");

            return Ok(info);
        }
    }
}