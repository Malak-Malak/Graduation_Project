
using System.ComponentModel.DataAnnotations;

namespace GPMS.Domain.Entities
{
    /// Represents any system user (Admin, Student, Supervisor).

    public class User
    {

        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; }

        public DateTime CreatedAt { get; set; }


        public StudentProfile StudentProfile { get; set; }
        public ICollection<TeamMember> TeamMembers { get; set; }
        public ICollection<TaskComment> TaskComments { get; set; }
        public ICollection<TaskAttachment> TaskAttachments { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<Team> SupervisedTeams { get; set; }
    }
}
