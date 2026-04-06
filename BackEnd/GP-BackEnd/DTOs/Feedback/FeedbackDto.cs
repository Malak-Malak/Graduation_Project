namespace GP_BackEnd.DTOs.Feedback
{
    public class FeedbackDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string SenderName { get; set; }
        public string SenderRole { get; set; }
        public int ProjectFileId { get; set; }
        public int Version { get; set; }
        public List<ReplyDto> Replies { get; set; } = new();
    }
}