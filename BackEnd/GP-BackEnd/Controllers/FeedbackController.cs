using GP_BackEnd.DTOs.Feedback;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GP_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly FeedbackService _feedbackService;

        public FeedbackController(FeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        // GET api/feedback/file/{fileId}
        // Returns all feedback + replies for a specific project file
        [HttpGet("file/{fileId}")]
        public async Task<IActionResult> GetFeedbacksByFile(int fileId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var feedbacks = await _feedbackService.GetFeedbacksByFileAsync(userId, fileId);
            return Ok(feedbacks);
        }

        // POST api/feedback/create
        // Supervisor creates feedback on a file
        [HttpPost("create")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.CreateFeedbackAsync(supervisorId, dto);

            if (!result)
                return BadRequest("Could not create feedback. Make sure the file exists and belongs to your team.");

            return Ok("Feedback created successfully.");
        }

        // POST api/feedback/reply
        // Any team member or supervisor can reply to existing feedback
        [HttpPost("reply")]
        public async Task<IActionResult> AddReply([FromBody] AddReplyDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.AddReplyAsync(userId, dto);

            if (!result)
                return BadRequest("Could not add reply. Feedback not found or you are not a member of this team.");

            return Ok("Reply added successfully.");
        }

        // PUT api/feedback/edit/{feedbackId}
        // Supervisor edits their own feedback
        [HttpPut("edit/{feedbackId}")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> EditFeedback(int feedbackId, [FromBody] EditContentDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.EditFeedbackAsync(supervisorId, feedbackId, dto.Content);

            if (!result)
                return BadRequest("Feedback not found or you are not the owner.");

            return Ok("Feedback updated successfully.");
        }

        // PUT api/feedback/edit-reply/{replyId}
        // Reply owner edits their own reply
        [HttpPut("edit-reply/{replyId}")]
        public async Task<IActionResult> EditReply(int replyId, [FromBody] EditContentDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.EditReplyAsync(userId, replyId, dto.Content);

            if (!result)
                return BadRequest("Reply not found or you are not the owner.");

            return Ok("Reply updated successfully.");
        }

        // DELETE api/feedback/delete/{feedbackId}
        // Supervisor deletes their feedback (replies cascade deleted)
        [HttpDelete("delete/{feedbackId}")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> DeleteFeedback(int feedbackId)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.DeleteFeedbackAsync(supervisorId, feedbackId);

            if (!result)
                return BadRequest("Feedback not found or you are not the owner.");

            return Ok("Feedback deleted successfully.");
        }

        // DELETE api/feedback/delete-reply/{replyId}
        // Reply owner deletes their own reply
        [HttpDelete("delete-reply/{replyId}")]
        public async Task<IActionResult> DeleteReply(int replyId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.DeleteReplyAsync(userId, replyId);

            if (!result)
                return BadRequest("Reply not found or you are not the owner.");

            return Ok("Reply deleted successfully.");
        }
    }
}