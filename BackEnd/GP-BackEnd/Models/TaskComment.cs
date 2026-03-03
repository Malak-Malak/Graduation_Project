
using System.ComponentModel.DataAnnotations;

namespace GP_BackEnd.Models
{
    /// Represents comments and replies on tasks.

    public class TaskComment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TaskItemId { get; set; }  
        public int UserId { get; set; }
        public int? ParentCommentId { get; set; }
        public TaskItem TaskItem { get; set; }
        public User User { get; set; }
        public TaskComment ParentComment { get; set; }
        public ICollection<TaskComment> Replies { get; set; }
    }
}
