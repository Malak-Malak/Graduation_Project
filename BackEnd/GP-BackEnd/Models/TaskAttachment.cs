
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GPMS.Domain.Entities
{

    /// Represents files uploaded to a task.
    public class TaskAttachment
    {
        [Key]
        public int Id { get; set; }

        public string FilePath { get; set; }

        public DateTime UploadedAt { get; set; }

        [ForeignKey("Task")]
        public int TaskId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public TaskItem Task { get; set; }
        public User User { get; set; }
    }
}
