using System.ComponentModel.DataAnnotations;
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
        public int TeamId { get; set; }
        public int? ProjectId { get; set; }
        public int CreatedByUserId { get; set; }
        public Team Team { get; set; }
        public Project Project { get; set; }
        public User CreatedBy { get; set; }
        public int Version { get; set; } = 0;
        public ICollection<TaskAssignment> Assignments { get; set; }

        public ICollection<Feedback> Feedbacks { get; set; }
    }
}