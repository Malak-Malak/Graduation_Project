using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class Team
    {
        [Key]
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public int SupervisorId { get; set; }
        public User Supervisor { get; set; }
        public ICollection<TeamMember> TeamMembers { get; set; }
        public ICollection<TaskItem> Tasks { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<TeamProgressReport> ProgressReports { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
    }
}