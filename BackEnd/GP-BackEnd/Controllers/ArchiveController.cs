using GP_BackEnd.DTOs.Archive;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArchiveController : ControllerBase
    {
        private readonly ArchiveService _archiveService;

        public ArchiveController(ArchiveService archiveService)
        {
            _archiveService = archiveService;
        }

        // GET api/archive
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetArchivedProjects()
        {
            var projects = await _archiveService.GetArchivedProjectsAsync();
            return Ok(projects);
        }

        // GET api/archive/{teamId}
        [HttpGet("{teamId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArchivedProjectById(int teamId)
        {
            var project = await _archiveService.GetArchivedProjectByIdAsync(teamId);
            if (project == null)
                return NotFound("Archived project not found.");
            return Ok(project);
        }

        // POST api/archive/submit
        [HttpPost("submit")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitProject([FromBody] int version)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _archiveService.SubmitProjectAsync(studentId, version);

            if (!result)
                return BadRequest("Could not submit project. Your team may not be active or already submitted.");

            return Ok("Project submitted for supervisor review.");
        }

        // GET api/archive/submitted-teams
        [HttpGet("submitted-teams")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetSubmittedTeams()
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var teams = await _archiveService.GetSubmittedTeamsAsync(supervisorId);
            return Ok(teams);
        }

        // POST api/archive/send-to-archive
        [HttpPost("send-to-archive")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> SendToArchive([FromBody] SendToArchiveDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _archiveService.SendToArchiveAsync(supervisorId, dto);

            if (!result)
                return BadRequest("Could not archive project. Team may not be submitted or already archived.");

            return Ok("Project successfully archived.");
        }
    }
}