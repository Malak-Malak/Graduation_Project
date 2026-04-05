namespace GP_BackEnd.DTOs.Feedback
{
    public class AddReplyDto
    {
        public string Content { get; set; }
        public int ParentFeedbackId { get; set; }
    }
}