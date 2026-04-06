namespace GP_BackEnd.DTOs.Feedback
{
    public class CreateFeedbackDto
    {
        public string Content { get; set; }
        public int TeamId { get; set; }
        public int? TaskItemId { get; set; }
        public int? ProjectFileId { get; set; }
    }
}