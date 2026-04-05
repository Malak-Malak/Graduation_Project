using GP_BackEnd.DTOs.Feedback;
using GP_BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        // GET api/feedback/team/{teamId}
        [HttpGet("team/{teamId}")]
        public async Task<IActionResult> GetTeamFeedbacks(int teamId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var feedbacks = await _feedbackService.GetTeamFeedbacksAsync(userId, teamId);
            return Ok(feedbacks);
        }

        // POST api/feedback/create
        [HttpPost("create")]
        [Authorize(Roles = "Supervisor")]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto dto)
        {
            var supervisorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.CreateFeedbackAsync(supervisorId, dto);

            if (!result)
                return BadRequest("Could not create feedback. You may not be the supervisor of this team.");

            return Ok("Feedback created successfully.");
        }

        // POST api/feedback/reply
        [HttpPost("reply")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> AddReply([FromBody] AddReplyDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.AddReplyAsync(studentId, dto);

            if (!result)
                return BadRequest("Could not add reply. Feedback not found or you are not a member of this team.");

            return Ok("Reply added successfully.");
        }

        // DELETE api/feedback/delete/{feedbackId}
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
        [HttpDelete("delete-reply/{replyId}")]
        public async Task<IActionResult> DeleteReply(int replyId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.DeleteReplyAsync(userId, replyId);

            if (!result)
                return BadRequest("Reply not found or you are not the owner.");

            return Ok("Reply deleted successfully.");
        }
        // PUT api/feedback/edit/{feedbackId}
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
        [HttpPut("edit-reply/{replyId}")]
        public async Task<IActionResult> EditReply(int replyId, [FromBody] EditContentDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _feedbackService.EditReplyAsync(userId, replyId, dto.Content);

            if (!result)
                return BadRequest("Reply not found or you are not the owner.");

            return Ok("Reply updated successfully.");
        }

    }
}