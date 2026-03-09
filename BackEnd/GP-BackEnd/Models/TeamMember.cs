
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GP_BackEnd.Models
{
    /// Many-to-Many relationship between Teams and Students.

    public class TeamMember
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Team")]
        public int TeamId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public bool HasRequestedLeave { get; set; } = false;
        public string LeaveStatus { get; set; } = "None";

        public Team Team { get; set; }
        public User User { get; set; }
    }
}
