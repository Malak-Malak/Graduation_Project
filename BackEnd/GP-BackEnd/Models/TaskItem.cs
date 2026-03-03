using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GP_BackEnd.Models
{
    public class TaskItem
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public string Status { get; set; }
        [Required]
        public DateTime Deadline { get; set; }
        [ForeignKey("Team")]
        public int TeamId { get; set; }
        public Team Team { get; set; }
        public int? ProjectId { get; set; }  
        public Project? Project { get; set; }
        public ICollection<TaskComment> Comments { get; set; }
        public ICollection<TaskAttachment> Attachments { get; set; }
    }
}