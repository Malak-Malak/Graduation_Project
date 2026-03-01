
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GPMS.Domain.Entities
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

        public Team Team { get; set; }
        public User User { get; set; }
    }
}
