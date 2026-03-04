using GP_BackEnd.DTOs.Auth;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST api/auth/request-access
        [HttpPost("request-access")]
        public async Task<IActionResult> RequestAccess([FromBody] SubmitRegistrationRequestDto dto)
        {
            var result = await _authService.SubmitRegistrationRequestAsync(dto);

            if (!result)
                return BadRequest("Request could not be submitted. Either your email is not in our system, you are not a graduate student, or a request already exists.");

            return Ok("Your request has been submitted. Please wait for admin approval.");
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (result == null)
                return Unauthorized("Invalid username or password.");

            return Ok(result);
        }
    }
}