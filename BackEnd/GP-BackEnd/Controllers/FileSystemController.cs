using GP_BackEnd.DTOs.FileSystem;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileSystemController : ControllerBase
    {
        private readonly FileSystemService _fileSystemService;

        public FileSystemController(FileSystemService fileSystemService)
        {
            _fileSystemService = fileSystemService;
        }

        // GET api/filesystem/supervisor-files
        [HttpGet("supervisor-files")]
        public async Task<IActionResult> GetSupervisorFiles()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var files = await _fileSystemService.GetSupervisorFilesAsync(userId);
            return Ok(files);
        }

        // GET api/filesystem/student-files
        [HttpGet("student-files")]
        public async Task<IActionResult> GetStudentFiles()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var files = await _fileSystemService.GetStudentFilesAsync(userId);
            return Ok(files);
        }

        // POST api/filesystem/add
        [HttpPost("add")]
        public async Task<IActionResult> AddAttachment([FromBody] AddAttachmentDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _fileSystemService.AddAttachmentAsync(userId, dto);

            if (!result)
                return BadRequest("Could not add attachment. You may not be in a team.");

            return Ok("Attachment added successfully.");
        }

        // PUT api/filesystem/edit/{attachmentId}
        [HttpPut("edit/{attachmentId}")]
        public async Task<IActionResult> EditAttachment(int attachmentId, [FromBody] EditAttachmentDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _fileSystemService.EditAttachmentAsync(userId, attachmentId, dto);

            if (!result)
                return BadRequest("Attachment not found or you are not the owner.");

            return Ok("Attachment updated successfully.");
        }

        // DELETE api/filesystem/delete/{attachmentId}
        [HttpDelete("delete/{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(int attachmentId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _fileSystemService.DeleteAttachmentAsync(userId, attachmentId);

            if (!result)
                return BadRequest("Attachment not found or you are not the owner.");

            return Ok("Attachment deleted successfully.");
        }
    }
}