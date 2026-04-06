using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GP_BackEnd.Models
{
    /// Represents a recurring or one-time office hour slot set by a supervisor.
    public class OfficeHour
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Supervisor")]
        public int SupervisorId { get; set; }
        public bool? IsOnline { get; set; } = false;

        /// e.g. "Sunday", "Monday" ... or a specific date
        public string DayOfWeek { get; set; }

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public User Supervisor { get; set; }
    }
}