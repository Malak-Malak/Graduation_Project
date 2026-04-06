using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace GP_BackEnd.Models
{
    public class Team
    {
        [Key]
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public string Status { get; set; } = "Pending";
        public int SupervisorId { get; set; }
        public int? ProjectId { get; set; }
        public int CreatedByUserId { get; set; }
        public User Supervisor { get; set; }
        public User CreatedBy { get; set; }
        public ICollection<ProjectFile> Attachments { get; set; }

        public ICollection<TeamMember> TeamMembers { get; set; }
        public ICollection<TaskItem> Tasks { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<TeamProgressReport> ProgressReports { get; set; }
        public Project Project { get; set; }
        public ICollection<Requirement> Requirements { get; set; }  // add this public ICollection<ProjectFile> Attachments { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
    }
}