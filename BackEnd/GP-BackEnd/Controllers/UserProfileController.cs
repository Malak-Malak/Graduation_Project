// Controllers/UserProfileController.cs
using GP_BackEnd.Data;
using GP_BackEnd.DTOs;
using GP_BackEnd.DTOs.UserProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/userprofile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Profile not found" });

            var dto = new UserProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                PhoneNumber = profile.PhoneNumber,
                FullName = profile.FullName,
                Department = profile.Department,
                Field = profile.field,
                TotalNumOfCreditCards = profile.TotalNumOfCreditCards,
                IsGraduate = profile.IsGraduate,
                MaxTeams = profile.MaxTeams
            };

            return Ok(dto);
        }

        // PUT: api/userprofile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Profile not found" });

            profile.PhoneNumber = dto.PhoneNumber;
            profile.FullName = dto.FullName;
            profile.field = dto.Field;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }
    }
}
