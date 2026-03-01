using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GPMS.Domain.Entities
{
    /// Represents a graduation project team.

    public class Team
    {
        [Key]
        public int Id { get; set; }

        public string ProjectTitle { get; set; }

        [ForeignKey("Supervisor")]
        public int SupervisorId { get; set; }

        public User Supervisor { get; set; }

        public ICollection<TeamMember> TeamMembers { get; set; }
        public ICollection<TaskItem> Tasks { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<TeamProgressReport> ProgressReports { get; set; }
    }
}
