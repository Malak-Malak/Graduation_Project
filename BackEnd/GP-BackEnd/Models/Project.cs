using System.ComponentModel.DataAnnotations;

namespace GP_BackEnd.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(300)]
        public string Title { get; set; }
        [MaxLength(2000)]
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        [Required]
        public bool Status { get; set; }
        [Required]
        public int SupervisorId { get; set; }
        public Team? Team { get; set; }
        public User Supervisor { get; set; }
        public ICollection<TaskItem> Tasks { get; set; }
        public ICollection<TeamProgressReport> ProgressReports { get; set; }
    }
}