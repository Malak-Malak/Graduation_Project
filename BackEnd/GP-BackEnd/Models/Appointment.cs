using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GP_BackEnd.Models
{
    /// Represents a meeting appointment between team and supervisor.
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        public DateTime DateTime { get; set; }

        /// Appointment status: Pending, Approved, Rejected
        public string Status { get; set; }

        public int Version { get; set; } = 0;

        public bool? IsOnline { get; set; } = true;

        public string Link { get; set; }

        /// Excuse provided when student requests a time change
        public string? Excuse { get; set; }

        [ForeignKey("Team")]
        public int TeamId { get; set; }

        public int SupervisorId { get; set; }

        public Team Team { get; set; }
        public User Supervisor { get; set; }
        public DateTime? ReminderSentAt { get; set; }
    }
}