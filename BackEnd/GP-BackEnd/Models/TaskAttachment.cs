
using System.ComponentModel.DataAnnotations;

namespace GP_BackEnd.Models
{

    /// Represents files uploaded to a task.
    public class TaskAttachment
    {
        [Key]
        public int Id { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }
        public int TaskItemId { get; set; }       
        public int UserId { get; set; }
        public TaskItem TaskItem { get; set; }  
        public User User { get; set; }
    }
}
