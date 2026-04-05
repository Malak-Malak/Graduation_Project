namespace GP_BackEnd.DTOs.Feedback
{
    public class ReplyDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string SenderName { get; set; }
        public string SenderRole { get; set; }
    }
}