using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
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
        public UserProfile UserProfile { get; set; }
        public ICollection<TeamMember> TeamMembers { get; set; }
        public ICollection<TaskAttachment> TaskAttachments { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<Team> SupervisedTeams { get; set; }
        public ICollection<TaskAssignment> TaskAssignments { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
    }
}