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
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _archiveService.SubmitProjectAsync(studentId, version);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // GET api/archive/submitted-teams
        [HttpGet("submitted-teams")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetSubmittedTeams()
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var teams = await _archiveService.GetSubmittedTeamsAsync(supervisorId);
            return Ok(teams);
        }

        // GET api/archive/team-files/{teamId}?version=0
        // Supervisor calls this to see files before choosing which to archive
        [HttpGet("team-files/{teamId}")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> GetTeamFiles(int teamId, [FromQuery] int version)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message, files) = await _archiveService
                .GetTeamFilesForVersionAsync(supervisorId, teamId, version);

            if (!success) return BadRequest(message);
            return Ok(files);
        }

        // POST api/archive/send-to-archive
        [HttpPost("send-to-archive")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> SendToArchive([FromBody] SendToArchiveDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (success, message) = await _archiveService.SendToArchiveAsync(supervisorId, dto);

            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // POST api/archive/search
        // Student describes their project idea and gets similar archived projects
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchArchive([FromBody] string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                return BadRequest("Please provide a description to search.");

            var results = await _archiveService.SearchArchivedProjectsAsync(description);
            return Ok(results);
        }

    }
}