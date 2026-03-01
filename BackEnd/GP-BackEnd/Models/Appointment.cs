
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GPMS.Domain.Entities
{

    /// Represents a meeting appointment between team and supervisor.

    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        public DateTime DateTime { get; set; }

        /// Appointment status (Pending, Approved, Rejected).
        public string Status { get; set; }

        [ForeignKey("Team")]
        public int TeamId { get; set; }

        public Team Team { get; set; }
    }
}
