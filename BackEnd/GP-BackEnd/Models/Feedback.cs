using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int SenderId { get; set; }
        public int TeamId { get; set; }
        public int? TaskItemId { get; set; }
        public int Version { get; set; } = 0;
        public int? ProjectFileId { get; set; }
        public ProjectFile ProjectFile { get; set; }
        public int? ParentFeedbackId { get; set; }
        public User Sender { get; set; }
        public Team Team { get; set; }
        public TaskItem TaskItem { get; set; }
        public Feedback ParentFeedback { get; set; }
        public ICollection<Feedback> Replies { get; set; }
    }
}