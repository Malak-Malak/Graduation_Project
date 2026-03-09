using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class TeamJoinRequest
    {
        [Key]
        public int Id { get; set; }
        public int TeamId { get; set; }
        public int StudentId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
        public string RequestType { get; set; } // "Invitation" or "Request"
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public Team Team { get; set; }
        public User Student { get; set; }
    }
}